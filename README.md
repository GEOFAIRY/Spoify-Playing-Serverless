# Spoify-Playing-Serverless

Serverless azure function to supply now playing from a given spotify user in JSON format.

# Setup

## Spotify

* Create a [Spotify Application](https://developer.spotify.com/dashboard/applications)
* Take note of:
    * `Client ID`
    * `Client Secret`
* Click on **Edit Settings**
* In **Redirect URIs**:
    * Add `http://localhost/callback/`

## Refresh Token

* Navigate to the following URL:

```
https://accounts.spotify.com/authorize?client_id={SPOTIFY_CLIENT_ID}&response_type=code&scope=user-read-currently-playing,user-read-recently-played&redirect_uri=http://localhost/callback/
```

* After logging in, save the {CODE} portion of: `http://localhost/callback/?code={CODE}`

* Create a string combining `{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}` (e.g. `5n7o4v5a3t7o5r2e3m1:5a8n7d3r4e2w5n8o2v3a7c5`) and **encode** into [Base64](https://base64.io/).

* Then run a [curl command](https://httpie.org/run) in the form of:
```sh
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Authorization: Basic {BASE64}" -d "grant_type=authorization_code&redirect_uri=http://localhost/callback/&code={CODE}" https://accounts.spotify.com/api/token
```

* Save the Refresh token

## .env config

Create the file ```local.settings.json``` in the format of:
```
{
  "IsEncrypted": false,
  "Values": {
    "spotify_client_id": "<<application client id>>",
    "spotify_client_secret": "<<application client secret>>",
    "spotify_refresh_token": "<<user generated refresh token>>",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

Refer to https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-node on how to build and deploy this project locallly or on azure.
