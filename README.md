# competelib-atom package

This README will guide you through the setup process. If some of these steps don't work for you, please let me know so we can improve this package or the instructions.

## Prerequisites

- If you're running Windows 10, first install WSL and use it to install the newest edition of Ubuntu.

In this case, do not install Atom on Ubuntu, install it on Windows. You'll use Ubuntu to build and run your programs written in C++. Why? Because the only decent GCC build for Windows - MinGW, has a lot of issues of its own. I recommend you stay away from it. You will not lose any performance and will easily be able to run multithreaded programs using WSL on Windows 10.

- You'll need to set up GCC version 10 or above on your Linux system (or subsystem if you're running Windows 10)

### Installing GCC

- On Ubuntu, run the following commands to install gcc-10:
```
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt update
sudo apt install gcc-10 g++-10
```

- On other Linux-based OSs, use your package manager to install gcc-10

## Setting up this package

Download this repository's contents into `~/.atom/packages` on Linux or `C:\Users\(your username)\.atom\packages` on Windows. For example, this README should be in `C:\Users\(your username)\.atom\packages\competelib-atom\README.md`.

You're almost there! If you want to use another version of GCC, go to the `lib` folder of this package, open the file `competelib-atom.js` and modify the value at the top of the file.

## Using this package

- Use `ctrl+alt+k` to compile `.cpp` files in "Debug" mode
- Use `ctrl+alt+o` to compile `.cpp` files in "Optimized" mode

To run the compiled executable, open a terminal (Ubuntu window on Windows), change the current directory to the one containing `xyz.cpp` file, and run it by typing `./xyz`. In WSL, Windows directories are mapped as follows: `D:\Prog\cpp\` becomes `/mnt/d/Prog/cpp`. Note that on Linux, paths are case sensitive.

**A feature to run your compiled executable from Atom is planned.**

You can change these shortcuts by modifying the file `keymaps/competelib-atom.json`.

Compilation errors and warnings will appear as highlighted text inside the source code, and also, you will receive a notification describing, in more detail, the errors themselves. You will also get notified of linker errors, if there are any. If you don't get any notification after a reasonable amount of time, perhaps the `g++` process crashed or the package is not correctly configured. In that case, first, read this README again, if that does not help, notify the package's author.

## Adding snippets

You can add your own snippets! First, take a look at the sample snippets in the `snippets` folder. The first line in each file should always be `'source.cpp'`, unless you want to add snippets for another language, of course. On the second level is the name of the snippet. Ideally, this should be a short description of it. Finally, `prefix` is what you should type in order for that snippet to be triggered, and `body` is the text that should be added.

You can use placeholders `$1`, `$2`, etc. These are the "blanks" that you can fill in after triggering the snippet. If you have more than one placeholder with the same number, these will be filled in in parallel. For example, if the body contains `read($1.x, $1.y, $1.z)`, after triggering the snippet, the cursor will be in three places at the same time, and after typing `point`, you'll get `read(point.x, point.y, point.z)`. You can exit this multi-cursor mode by clicking anywhere in the editor or by pressing Esc. You can enter it manually if you hold `Ctrl+Alt` and click.
