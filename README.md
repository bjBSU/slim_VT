# LoggerDisplay

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


# User Guide - Setup

## 1. Git clone this repository  

## 2. Install necessary imports
This may include cloning retico repositorys into the same folder the Vis. Tool is located.

## 3. Create runner file  
Example Runner:
  `import os, sys
  os.environ['GASR'] = 'retico-googleasr'
  os.environ['RETICO'] = 'retico-core'
  os.environ['WASR'] = 'retico-whisperasr'
  os.environ['DASR'] = 'retico-wav2vecasr'
  os.environ['ZMQ'] = 'retico-zmq'
  os.environ['RETICOV'] = 'retico-vision'
  os.environ['DASR'] = 'retico-wav2vecasr'
  
  sys.path.append(os.environ['GASR'])
  sys.path.append(os.environ['WASR'])
  sys.path.append(os.environ['RETICO'])
  sys.path.append(os.environ['DASR'])
  sys.path.append(os.environ['ZMQ'])
  sys.path.append(os.environ['RETICOV'])
  sys.path.append(os.environ['DASR'])
  
  import retico_core
  from retico_core.debug import DebugModule
  from retico_whisperasr.whisperasr import WhisperASRModule
  from retico_zmq.zmq import WriterSingleton, ZeroMQWriter
  from retico_core.audio import MicrophoneModule
  from retico_wav2vecasr.wav2vecasr import Wav2VecASRModule
  
  
  # configure loggers
  terminal_logger, file_logger, server_logger = retico_core.log_utils.configurate_logger(
      "logs/run", filters = None, server_port='http://localhost:3000'
  )
  
  microphone = MicrophoneModule()
  asr = WhisperASRModule(language="english")
  debug = DebugModule(print_payload_only=True)
  wav2vec_asr = Wav2VecASRModule()
  
  ip = '127.0.0.1'#10.253.18.143' use the writer PC's IP
  WriterSingleton(ip=ip, port='6002')#figure out ip
  zmqwriter = ZeroMQWriter(topic='asr')
  microphone.subscribe(asr)
  microphone.subscribe(wav2vec_asr)
  asr.subscribe(zmqwriter)
  zmqwriter.subscribe(debug)
  #additional tests
  wav2vec_asr.subscribe(debug)
  microphone.subscribe(debug)
  asr.subscribe(debug)
  
  microphone.run()
  wav2vec_asr.run()
  asr.run()
  zmqwriter.run()
  debug.run()
  
  input()
  
  asr.stop()
  wav2vec_asr.stop()
  microphone.stop()
  zmqwriter.stop()
  debug.stop()`

## 4. Add the logger configure line to runner if not already added
  Inside runner adding the following commands to ensure that the node.js server will be set up.
  `# configure loggers
terminal_logger, file_logger, server_logger = retico_core.log_utils.configurate_logger(
    "logs/run", filters = None, server_port='http://localhost:3000'
)`
- Additionaly ensure that the correct branch of retico-core is being used

## 5. Open two separate anaconda terminals
  - In one terminal go to the location of the cloned repository.
  - In the other go to the location of the runner file.

  5.1 First in the terminal with the Angular logger component enter - ng serve - once inside the logger,     this     (in a few seconds will spin up the angular application. Once its spun up click or go to the location. 
  `ng serve`
  
  5.2 In the second terminal start up the runner soon after by running:
  `python runner.py`
  
## * Note *  
Once both terminals are running wait a couple of seconds and the modules should show (the more complicated the connections the longer it may take).

If you need to restart the runner for whatever reason close the old and then refresh the angular application.

If you need to restart the angular application, stop the runner and follow step 5.
