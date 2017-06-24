# webida-client
[![DeepScan Grade](https://deepscan.io/api/projects/30/branches/37/badge/grade.svg)](https://deepscan.io/dashboard/#view=project&pid=30&bid=37)

Web based IDE

## Installation Guide

Checkout and install [webida-server](https://github.com/webida/webida-server)

Then, checkout this repository.

And send deploy request to the webida-server with access_token(`$TOKEN`).

```
$cd webida-client
$tar czpf - * | curl -k -X POST -F content=@- "http://webida.mine:5001/webida/api/app/deploy?appid=webida-client&access_token=$TOKEN"
```

you can find `$TOKEN` at the server's initial DB data.

```
$ mongo
> use webida_auth
> db.tokens.find({uid: 100000}, {token: 1, _id: 0})
{ "token" : "thisIsATokenString" }  # this is the $TOKEN
```

Now you can access client app with the below url address.

* http://webida.mine:5001/
