import requests
hash = '7A6ECCDB792062797AA4F6BEE12199219EC8749641BA50B3138DD4857A65173D'
response = requests.post('https://rtstockdata.azurewebsites.net/update', data={'hash':hash, 'data': {'MSFT':{'time1':1}}})