const axios = require('axios')

const _REFRESHTOKEN = process.env.spotify_refresh_token
const _CLIENTSECRET = process.env.spotify_client_secret
const _CLIENTID = process.env.spotify_client_id

function getAuth() {
    var str = _CLIENTID + ':' + _CLIENTSECRET
    const buffer = Buffer.from(str, 'utf-8')
    return buffer.toString('base64')
}

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

    try {
        const res = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            params: data,
            headers: headers,
        })
        access_token = res.data.access_token
    } catch (error) {
        throw new Error(error)
    }
    return access_token
}

async function getPlaying() {
    res = {}
    var token = await refreshToken()
    var headers = { Authorization: 'Bearer ' + token }

    try {
        const spotify_res_current = await axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: headers,
        })

        if (spotify_res_current.status === 204) {
            res = await getrecent(res)
        } else {
            // now playing
            res = {
                status: 200,
                body: {
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
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        }
    } catch (error) {
        throw new Error(error)
    }
    return res
}

async function getrecent(res) {
    // recently played
    var token = await refreshToken()
    var headers = { Authorization: 'Bearer ' + token }

    try {
        const spotify_res_recent = await axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/me/player/recently-played?limit=1',
            headers: headers,
        })

        res = {
            status: 200,
            body: {
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
            },
            headers: {
                'Content-Type': 'application/json',
            },
        }
    } catch (error) {
        throw new Error(error)
    }
    return res
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.')
    try {
        // do the thing
        var res = await getPlaying()
        context.res = {
            body: res,
        }
    } catch (error) {
        context.res = {
            status: 500,
            body: `Request error. ${error}`,
        }
    }
}
