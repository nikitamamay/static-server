# static-server
StaticServer is a program that opens a WEB server listener on given port (default is 4000).
A request to `/` returns a list of hyperlinks to files that are present in the specified directory.
A user can click on a hyperlink and download the file.

This program is intended to be used in LAN and **it is not protected from any attack.** Be careful setting this StaticServer on open port!

Usage:
 `./static_server <path> [<args>]`

Arguments:
  * `<path>`\
      **Necessary.** Defines a path to a directory, which will be a server static resources directory.
  * `<args>`:
      * `-p <number>`\
          Defines the server PORT, on which it will be listening.
          Defaulf is 4000.
      * `-i <filepath>`\
          Main file (such as `index.html`), which will be accessible on `/`.
          `<filepath>` can be absolute as well as relative (to given directory).
      * `-q`\
          Quiet mode.
      * `-v`\
          Verbose mode. Default.
      * `-help`\
          Show help and exit.
