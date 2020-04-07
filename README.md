# competelib-atom package

This README will guide you through the setup process. If some of these steps don't work for you, please let me know so we can improve this package or the instructions.

## Prerequisites

- If you're running Windows 10, first install WSL and use it to install the newest edition of Ubuntu.

In this case, do not install Atom on Ubuntu, install it on Windows. You'll use Ubuntu to build and run your programs written in C++. Why? Because the only decent GCC build for Windows - MinGW, has a lot of issues of its own. I recommend you stay away from it. You will not lose any performance and will easily be able to run multithreaded programs using WSL on Windows 10.

- You'll need to set up `g++` version 9 or above on your Linux system (or subsystem if you're running Windows 10)

### Installing g++

- On Ubuntu, run the following commands to install gcc-9:
```
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt update
sudo apt install gcc-9
```

- On other Linux-based OSs, use your package manager to install gcc-9

## Setting up this package

You're almost there! If you want to use another version of GCC, go to the `lib` folder of this package, open the file `competelib-atom.js` and modify the values at the top of the file.

## Using this package

- Use `ctrl+alt+k` to compile `.cpp` files in "Debug" mode
- Use `ctrl+alt+o` to compile `.cpp` files in "Optimized" mode

You can change these shortcuts by modifying the file `keymaps/competelib-atom.json`.

Compilation errors and warnings will appear as highlighted text inside the source code, and also, you will receive a notification describing, in more detail, the errors themselves. You will also get notified of linker errors, if there are any. If you don't get any notification after a reasonable amount of time, perhaps the `g++` process crashed or the package is not correctly configured. In that case, first, read this README again, if that does not help, notify the package's author.

You can add your own snippets, simply take a look at the sample snippets in the `snippets` folder and modify them to suit your need.
