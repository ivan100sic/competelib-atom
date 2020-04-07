'use babel';

const gppWindows = 'g++-9'
const gppLinux = 'g++-9'

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

export default {

  subscriptions: null,
  aliveMarkers: [],

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'competelib-atom:build-debug': () => this.build(['-g']),
      'competelib-atom:build-o2': () => this.build(['-O2'])
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  build(extraOptions) {
    var editor = atom.workspace.getActiveTextEditor()
    if (!editor) {
      return
    }
    editor.save()
    var spawn = require('child_process').spawn
    var path = atom.workspace.getActiveTextEditor().getPath()
    var fn = path.split('\\').slice(-1)[0]
    var ext = fn.substring(fn.length - 4, fn.length) // take the extension
    // if it's not .cpp, abort
    if (ext != '.cpp') {
      editor.insertText('not cpp but ')
      editor.insertText(ext)
      return
    }
    var outn = fn.substring(0, fn.length - 4) // take filename w/o extension
    path = path.substring(0, path.length - fn.length)

    options = [gppWindows, '-std=c++17', '-pthread', '-fdiagnostics-format=json', '-Wall']
    options = options.concat(extraOptions)
    options = options.concat([fn, '-o', outn])

    // play with these to customize the compilation command
    var rt = spawn('wsl', options, { 'cwd': path })

    var err = ''

    rt.stderr.on('data', (x) => {
      err += x
    })

    rt.stderr.on('end', () => finish_compilation(editor, err, this))
  }

};
