const client = require('../resource/elasticsearch')

class UserDao {
    async save(user) {
        user.created = new Date().getTime()
        delete user.password

        const response = await client.index({
            index: 'user',
            type: 'user',
            id: user.email,
            body: user
        })

        console.log('user dao save response', response)
    }

    async getUser(email, fields) {
        const response = await client.get({
            index: 'user',
            type: 'user',
            id: email,
            _source: fields
        })

        console.log('user dao get user', response)

        return response._source
    }

    async search(query, page, count) {
        const response = await client.search({
            index: 'user',
            body: {
                query: {
                    bool: {
                        should: [
                            {
                                match: {
                                    nickname: query
                                },
                            },
                            {
                                match: {
                                    skills: query
                                }
                            }
                        ],
                        must: [
                            {
                                term: {
                                    verified: true
                                }
                            }
                        ],
                        minimum_should_match: 1
                    }
                }
            },
            from: (page - 1) * count,
            size: count,
        })

        var result = new Array()

        response.hits.hits.forEach(hit => {
            result.push(hit._source)
        })

        console.log('search user result', result)

        return result
    }

    async updateToken(email, token) {
        const response = await client.update({
            index: 'user',
            type: 'user',
            id: email,
            body: {
                doc: {
                    token: token
                }
            }
        })

        console.log('token update result', response)
    }

    async unbindToken(email) {
        const response = await client.update({
            index: 'user',
            type: 'user',
            id: email,
            body: {
                doc: {
                    token: ''
                }
            }
        })

        console.log('unbind token result', response)
    }

    async setVerified(email) {
        const response = await client.update({
            index: 'user',
            type: 'user',
            id: email,
            body: {
                doc: {
                    verified: true
                }
            }
        })

        console.log('set verified result', response)
    }

    async getProjectUsers(projectId, fields) {
        const res = await client.search({
            index: 'user',
            type: 'user',
            body: {
                query: {
                    term: {
                        project: projectId
                    }
                },
            },
            _source: fields
        })

        console.log('get project users response', res)

        return res.hits.hits
    }

    async joinProject(email, projectId) {
        const response = await client.update({
            index: 'user',
            type: 'user',
            id: email,
            body: {
                script: {
                    source: 'if (!ctx._source.projects.contains(params.project)) {ctx._source.projects.add(params.project);}',
                    lang: 'painless',
                    params: {
                        project: projectId
                    }
                }
            }
        });

        console.log('join project response', response)
    }

    async quitProject(email, projectId) {
        const response = await client.update({
            index: 'user',
            type: 'user',
            id: email,
            body: {
                script: {
                    source: 'ctx._source.projects.remove(ctx._source.projects.indexOf(params.project))',
                    lang: 'painless',
                    params: {
                        project: projectId
                    }
                }
            }
        });

        console.log('quit project response', response)
    }
}

module.exports = exports = new UserDao();
