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
        // TODO
    }
}

module.exports = exports = new ProjectDao();
