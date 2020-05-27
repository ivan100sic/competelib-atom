'use babel';

const gpp = 'g++-9'

// import CompetelibAtomView from './competelib-atom-view';
import { CompositeDisposable } from 'atom';

function finish_compilation(editor, msg, state) {
  state.aliveMarkers.forEach((marker) => {
    marker.destroy()
  })
  state.aliveMarkers = []
  var splat = msg.split('\n')
  splat.pop()
  var obj = JSON.parse(splat[0])
  var validClasses = ['error', 'warning', 'linker']
  var outputCount = {}
  var outputDetail = {}
  validClasses.forEach((cls) => {
    outputCount[cls] = 0
    outputDetail[cls] = ''
  });

  if (splat.length > 1) {
    outputDetail.linker = splat.slice(1).join('\n')
    outputCount.linker = 1
  }

  obj.forEach((err) => {
    err.locations.forEach((loc) => {
      var from = [loc.caret.line-1, loc.caret.column-1]
      var to = [loc.caret.line-1, loc.caret.column]
      if ('finish' in loc) {
         to = [loc.finish.line-1, loc.finish.column]
      }
      if (err.kind == 'error' || err.kind == 'warning') {
        var marker = editor.markBufferRange([from, to], {})
        state.aliveMarkers.push(marker)
        editor.decorateMarker(marker, {'type': 'highlight', 'class': 'highlight-' + err.kind})
        outputCount[err.kind] += 1
        outputDetail[err.kind] += '' + (from[0]+1) + ':' + from[1] + ': ' + err.message + '\n'
      }
    })
  })

  if (outputCount.error > 0) {
    atom.notifications.addError('There are build errors.', {
      'detail' : outputDetail.error,
    })
  }

  if (outputCount.warning > 0) {
    atom.notifications.addWarning('There are build warnings.', {
      'detail' : outputDetail.warning,
    })
  }

  if (outputCount.linker > 0) {
    atom.notifications.addError('There are linker errors.', {
      'detail' : outputDetail.linker,
    })
  }

  if (outputCount.error + outputCount.warning + outputCount.linker == 0) {
    atom.notifications.addSuccess('Build succeeded!', {})
  }
}

function mySpawn(tokens, spawnOptions, stream, callback) {
  var options = []
  var executable = ''
  var spawn = require('child_process').spawn
  if (process.platform == 'linux') {
    executable = tokens[0]
    options = tokens.slice(1)
  } else {
    executable = 'wsl'
    options = tokens
  }

  var runtime = spawn(executable, options, spawnOptions)
  var output = ''
  runtime[stream].on('data', (x) => { output += x })
  runtime[stream].on('end', () => callback(output))
}

export default {

  subscriptions: null,
  aliveMarkers: [],

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'competelib-atom:build-debug': () => this.build_debug(),
      'competelib-atom:build-o2': () => this.build_o2()
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  build_debug() {
    // check if the version of ld is supports fsanitize=undefined
    mySpawn(['ld', '-v'], {}, 'stdout', (output) => {
      var flags = ['-g']
      var version = output.split(' ').slice(-1)[0].split('.').map((x) => parseInt(x))

      if (version.length == 2 && (version[0] > 2 || (version[0] == 2 && version[1] >= 30))) {
        flags.push('-fsanitize=address,undefined')
      } else {
        flags.push('-fsanitize=address')
      }

      this.build(flags, 'Debug')
    })
  },

  build_o2() {
    this.build(['-O2'], 'Optimized')
  },

  build(extraOptions, name) {
    var editor = atom.workspace.getActiveTextEditor()
    if (!editor) {
      return
    }

    if (process.platform != 'linux' && process.platform != 'win32') {
      atom.notifications.addError('Your platform is not supported by competelib-atom :(', {})
      return
    }

    editor.save()
    var path = editor.getPath()
    var fn = path.split('\\').slice(-1)[0]
    var ext = fn.substring(fn.length - 4, fn.length) // take the extension
    // if it's not .cpp, abort
    if (ext != '.cpp') {
      return
    }

    var outn = fn.substring(0, fn.length - 4) // take filename w/o extension
    path = path.substring(0, path.length - fn.length)

    var tokens = [gpp]

    tokens = tokens.concat(['-std=c++17', '-DLOCAL', '-pthread', '-fdiagnostics-format=json', '-Wall'])
    tokens = tokens.concat(extraOptions)
    tokens = tokens.concat([fn, '-o', outn])

    atom.notifications.addInfo(`Build started. (${name})`, {
      'detail': tokens.join(' ')
    })

    mySpawn(tokens, { 'cwd': path }, 'stderr', (err) => finish_compilation(editor, err, this))
  }

};
