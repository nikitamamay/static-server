
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();


let config = {
  VERBOSE: true,
  PORT: 4000,
  DIRECTORY: null,
  INDEX: null,
};


const showHelp = () => console.log(
`    This is StaticServer. It acts like a static ftp-server: holds just a directory
and sends all files from it that are requested by user.

    Caution! Never set this StaticServer on open port!
    This program is not protected from any attack.

Usage:
    ./static_server <path> [<args>]

    <path>
        [NECESSARY] Defines a path to a directory, which will be a server
        static resources directory.

    <args>:
        -p <number>
            [DEFAULT = 4000] Defines the server PORT, on which it will be listening.

        -i <filepath>
            Main file (such as "index.html"), which will be accessible on "/".
            <filepath> can be absolute as well as relative (to given directory).

        -q
            Quiet mode.

        -v
            [DEFAULT] Verbose mode.

        -help
            Help.`
);


const constructDirLinksHTML = (text) => `
<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StaticServer</title>
      <style>
        body {
          font-family: monospace;
          font-size: 120%
        }
        ul {
          flex-direction: column;
          list-style: none;
          display: none
        }
        ul.main {
          display: flex;
          padding-left: 0
        }
        button.o+ul {
          display: flex
        }
        a {
          color: black;
          text-decoration: none
        }
        a:hover,
        a:focus,
        button:hover,
        button:focus {
          text-decoration: underline;
          color: brown;
          outline: none
        }
        li.d {
          order: -1
        }
        button {
          all: inherit;
          color: #356fd7;
          font-weight: bold;
          cursor: pointer
        }
        button::before {
          content: "";
          display: inline-block;
          width: 16px;
          height: 16px;
          background:
            url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMTYiCiAgIGhlaWdodD0iMTYiCiAgIHZpZXdCb3g9IjAgMCA0LjIzMzMzMzIgNC4yMzMzMzM1IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmc4IgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgNWRhNjg5YzMxMywgMjAxOS0wMS0xNCIKICAgc29kaXBvZGk6ZG9jbmFtZT0iZm9sZGVyX2Fycm93LnN2ZyI+CiAgPGRlZnMKICAgICBpZD0iZGVmczIiIC8+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGlkPSJiYXNlIgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxLjAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAuMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnpvb209IjMxLjY3ODM4NCIKICAgICBpbmtzY2FwZTpjeD0iNi43MzAwNjI0IgogICAgIGlua3NjYXBlOmN5PSI1LjI1MjE5NzIiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtdW5pdHM9InB4IgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9ImxheWVyMSIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxOTIwIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjEwMjciCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIKICAgICB1bml0cz0icHgiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGUgLz4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iTGF5ZXIgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtMjkyLjc2NjY1KSI+CiAgICA8cGF0aAogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIGlkPSJwYXRoODE2IgogICAgICAgZD0ibSAxLjM4MDU5MywyOTMuNDA5MTUgMS40NzQxNiwxLjQ3NDE1IC0xLjQ3NDE2LDEuNDc0MTYiCiAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMzU2ZmQ3O3N0cm9rZS13aWR0aDowLjM5Njg3NDk5O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgc29kaXBvZGk6bm9kZXR5cGVzPSJjY2MiCiAgICAgICBpbmtzY2FwZTpleHBvcnQteGRwaT0iOTYiCiAgICAgICBpbmtzY2FwZTpleHBvcnQteWRwaT0iOTYiIC8+CiAgPC9nPgo8L3N2Zz4K')
            no-repeat center center;
          transition: transform .2s;
          vertical-align: middle
        }
        button.o::before {
          transform: rotate(90deg)
        }
      </style>
   </head>
   <body>
      <ul class=main>
         ${text}
      </ul>
      <script>
         for (let el of document.getElementsByTagName("button")) {
           el.onclick = () => {
               el.classList.toggle("o");
           }
         }
      </script>
   </body>
</html>
`;


const fatalError = (msg) => {
  console.error(msg);
  process.exit();
};


let args = {
  next: () => {
    ++args.iter;

    if (args.iter >= process.argv.length)
      return false;

    return process.argv[args.iter];
  },

  checkIfOnce: (arg) => {
    if (args.argv[arg]) {
      fatalError(`Argument "${arg}" is already specified!`);
    }

    args.argv[arg] = true;

    if ((arg == "-v" || arg == "-q") && Boolean(args.argv["-v"]) == Boolean(args.argv["-q"])) {
      fatalError(`Arguments "-v" and "-q" are conflicting!`)
    }
    return arg;
  },

  iter: 1,
  argv: {},
};


const access = (path, mode=0) => {
  /*
    mode=0  checks if file/dir exists;
    mode=1  checks if file exists and it is file;
    mode=2  checks if dir exists and it is dir;
  */
  try {
    stat = fs.statSync(path);
    if (mode > 0 && stat.isDirectory() != Boolean(mode - 1)) {
      fatalError(`"${path}" is not a ${["file", "directory"][mode - 1]}!`);
    }
  } catch (e) {
    fatalError(`"${path}" does not exist!`);
  }
}


const logV = (...args) => {
  if (config.VERBOSE)
    console.log(...args);
};


const dumpTime = () => {
  const p = (smth, count=2) => smth.toString().padStart(count, "0");
  let t = new Date();
  return `${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}.${p(t.getMilliseconds(), 3)}`;
};


const constructDirLinks = (dirpath, linkPath="") => {
  text = ``;
  let dirEnts = fs.readdirSync(dirpath + "/" + linkPath, { withFileTypes: true });
  dirEnts.sort((a, b) => parseInt(a.name) - parseInt(b.name));
  for (let dirEnt of dirEnts) {
    if (dirEnt.isDirectory()) {
      text += `<li class=d>\n<button>${dirEnt.name}/</button>\n<ul>\n${constructDirLinks(dirpath, linkPath + dirEnt.name + "/")}</ul></li>\n`;
    } else {
      text += `<li><a href="/${linkPath + dirEnt.name}">${dirEnt.name}</a></li>\n`;
    }
  }
  return text;
};


// Parsing arguments

while (arg = args.next()) {
  switch(arg = args.checkIfOnce(arg)) {
    case "-h":
    case "-help":
      showHelp();
      process.exit();
      break;

    case "-p":
      config.PORT = Number(args.next());
      break;

    case "-i":
      config.INDEX = args.next();
      access(config.INDEX, 1);
      config.INDEX = path.resolve(config.INDEX);
      break;

    case "-v":
      config.VERBOSE = true;
      break;

    case "-q":
      config.VERBOSE = false;
      break;

    default:
      if (config.DIRECTORY)
        // Error if the directory path is already specified
        fatalError(`Undefined argument "${arg}"!`);

      config.DIRECTORY = path.resolve(arg);
      access(config.DIRECTORY, 2);
  }
}


// Setting listeners

app.all("*", (req, res, next) => {
  logV(`[${dumpTime()} ${req.ip}] ${req.method} ${req.url}`);
  next();
});


if (config.INDEX) {
  // Sending specified file on "/"
  app.get("/", (req, res) => {
    try {
      res.sendFile(config.INDEX);
    }
    catch(e) {
      logV(dumpTime(), e.name, e.message);
      res.end(`<!DOCTYPE html>${e.name}!<br>${e.message}`);
    }
  });
}
else {
  // Sending list of files in the specified directory
  app.get("/", (req, res) => {
    try {
      let result = constructDirLinksHTML( constructDirLinks(config.DIRECTORY) );
      return res.end(result);
    }
    catch(e) {
      logV(dumpTime(), e.name, e.message);
      return res.end(`<!DOCTYPE html>\n${e.name}!<br>${e.message}`);
    }

  });
}


app.use("/", express.static(config.DIRECTORY));


app.listen(config.PORT, () => {
  logV(`Listening directory "${config.DIRECTORY}"
  on PORT ${config.PORT}...`);
});
