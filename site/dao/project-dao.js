const client = require('../resource/elasticsearch')

class ProjectDao {
    async save(project) {
        project.id = new Date().getTime()

        const response = await client.index({
            index: 'project',
            type: 'project',
            id: project.id,
            body: project
        })

        console.log('project dao save response', response)
    }

    async update(projectId, project) {
        var script = "";

        for (const key in profile) {
            if (script.length != 0) {
                script += ' ';
            }

            var val = profile[key];
            if (Array.isArray(val)) {
                script += 'if (ctx._source.' + key + ' == null) {ctx._source.' + key + ' = new ArrayList()} for (v in params.' + key + ') {if (!ctx._source.' + key + '.contains(v)) {ctx._source.' + key + '.add(v)}}'
            } else {
                script += 'ctx._source.' + key + '=params.' + key;
            }
        }

        const response = await client.update({
            index: 'project',
            type: 'project',
            id: projectId,
            body: {
                script: {
                    source: script,
                    lang: 'painless',
                    params: project
                }
            }
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

    async search(query, page, count) {
        const response = await client.search({
            index: 'project',
            body: {
                query: {
                    bool: {
                        should: [
                            {
                                match: {
                                    name: query
                                }
                            },
                            {
                                match: {
                                    skills: query
                                }
                            },
                            {
                                match: {
                                    desc: query
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

        console.log('search project result', result)

        return result
    }
}

module.exports = exports = new ProjectDao();
