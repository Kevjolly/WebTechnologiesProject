const client = require('../resource/elasticsearch')

class ProjectDao {
    async save(project) {
        const response = await client.index({
            index: 'project',
            type: 'project',
            id: project.id,
            body: project
        })

        await client.indices.refresh({
            index: 'project'
        });

        console.log('project dao save response', response)
    }

    async update(projectId, project) {
        const response = await client.update({
            index: 'project',
            type: 'project',
            id: projectId,
            body: {
                doc: project
            }
        });

        await client.indices.refresh({
            index: 'project'
        });

        console.log('edit project response', response)
    }

    async getProject(projectId, fields) {
        const response = await client.get({
            index: 'project',
            type: 'project',
            id: projectId,
            _source: fields
        })

        console.log('project dao get project', response)

        return response._source
    }

    async getProjects(projects) {
        const response = await client.search({
            index: 'project',
            body: {
                query: {
                    terms: {
                        id: projects
                    }
                }
            }
        })

        var result = new Array()

        response.hits.hits.forEach(hit => {
            result.push(hit._source)
        })

        console.log('project dao get projects', result)

        return result
    }

    async search(keywords, page, count) {
        var request = {
            index: 'project',
            body: {
                query: {
                    bool: {
                        should: [],
                        minimum_should_match: 1
                    }
                }
            },
            from: (page - 1) * count,
            size: count,
        }

        keywords.forEach(keyword => {
            request.body.query.bool.should.push({
                match: {
                    name: keyword
                }
            },
            {
                match: {
                    skills: keyword
                }
            },
            {
                match: {
                    desc: keyword
                }
            })
        })

        const response = await client.search(request)

        var result = new Array()

        response.hits.hits.forEach(hit => {
            result.push(hit._source)
        })

        console.log('search project result', response, result)

        return {
            projects: result,
            total: response.hits.total
        }
    }
}

module.exports = exports = new ProjectDao();
