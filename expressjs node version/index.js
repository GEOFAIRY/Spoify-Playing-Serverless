require('dotenv').config()

const express = require('express')
const PORT = 3000

const axios = require('axios')
// axios.interceptors.request.use((request) => {
//     console.log('Starting Request', JSON.stringify(request, null, 2))
//     return request
// })

// axios.interceptors.response.use((response) => {
//     console.log('Response:', JSON.stringify(response, null, 2))
//     return response
// })

const _REFRESHTOKEN = process.env.spotify_refresh_token
const _CLIENTSECRET = process.env.spotify_client_secret
const _CLIENTID = process.env.spotify_client_id

var app = express()
app.listen(PORT, () => {
    console.log('listening on', PORT)
})

app.get('/current-playing', async (req, res) => {
    var token = await refreshToken()

    var headers = { Authorization: 'Bearer ' + token }
    axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: headers,
    })
        .then(async function (spotify_res_current) {
            if (spotify_res_current.status === 204) {
                res = await getrecent(res)
            } else {
                // now playing
                res.json({
                    album: {
                        name: spotify_res_current.data.item.album.name,
                        image: spotify_res_current.data.item.album.images[0]
                            .url,
                        link: spotify_res_current.data.item.album.external_urls
                            .spotify,
                    },
                    artist: {
                        name: spotify_res_current.data.item.artists[0].name,
                        link: spotify_res_current.data.item.artists[0]
                            .external_urls.spotify,
                    },
                    track: {
                        name: spotify_res_current.data.item.name,
                        link: spotify_res_current.data.item.external_urls
                            .spotify,
                    },
                })
            }
        })
        .catch(function (err) {
            console.error(err)
        })
})

async function refreshToken() {
    var access_token
    data = {
        grant_type: 'refresh_token',
        refresh_token: _REFRESHTOKEN,
    }

    headers = {
        Authorization: 'Basic ' + getAuth(),
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: data,
        headers: headers,
    })
        .then(function (res) {
            access_token = res.data.access_token
        })
        .catch(function (err) {
            console.log(err)
        })
    return access_token
}

function getAuth() {
    var str = _CLIENTID + ':' + _CLIENTSECRET
    const buffer = Buffer.from(str, 'utf-8')
    return buffer.toString('base64')
}

async function getrecent(res) {
    // recently played
    var token = await refreshToken()
    var headers = { Authorization: 'Bearer ' + token }

    axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        headers: headers,
    })
        .then(function (spotify_res_recent) {
            res.json({
                album: {
                    name: spotify_res_recent.data.items[0].track.album.name,
                    image: spotify_res_recent.data.items[0].track.album
                        .images[0].url,
                    link: spotify_res_recent.data.items[0].track.album
                        .external_urls.spotify,
                },
                artist: {
                    name: spotify_res_recent.data.items[0].track.artists[0]
                        .name,
                    link: spotify_res_recent.data.items[0].track.artists[0]
                        .external_urls.spotify,
                },
                track: {
                    name: spotify_res_recent.data.items[0].track.name,
                    link: spotify_res_recent.data.items[0].track.external_urls
                        .spotify,
                },
            })
        })
        .catch(function (err) {
            console.error(err)
        })
    return res
}
