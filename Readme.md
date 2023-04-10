## Mozart UI Libraries
### Clone
> ```
> git clone https://github.com/vmslab/mozart-ui-lib
> ```


## Mozart UI Applications
### Clone
> ```
> git clone https://github.com/vmslab/mozart-ui-lib mozart-ui-app
> cd mozart-ui-app
> git remote set-url origin https://github.com/vmslab/mozart-ui-app
> git remote add upstream https://github.com/vmslab/mozart-ui-lib
> ```
### Push 
> #### mozart-ui-app
> ```
> git push origin main
> ```
> #### ~~mozart-ui-lib (deprecated)~~
> ```
> git push upstream main
> ```
### Pull
> #### mozart-ui-app
> ```
> git pull origin main
> ```
> #### mozart-ui-lib
> ```
> git pull upstream main
> ```

## Mozart UI Templates
### Clone
> ```
> git clone https://github.com/vmslab/mozart-ui-lib mozart-ui-template
> cd mozart-ui-template
> git remote set-url origin https://github.com/vmslab/mozart-ui-template
> git remote add upstream https://github.com/vmslab/mozart-ui-lib
> ```
### Push 
> #### mozart-ui-template
> ```
> git push origin main
> ```
> #### ~~mozart-ui-lib (deprecated)~~
> ```
> git push upstream main
> ```
### Pull
> #### mozart-ui-template
> ```
> git pull origin main
> ```
> #### mozart-ui-lib
> ```
> git pull upstream main
> ```

### Trouble Shooting
1. peer dependencies issue
	```
	rimraf node_modules && lerna clean --yes
	pnpm up --config.strict-peer-dependencies=false
	pnpm i
	```
