const projectDao = require('../dao/project-dao')

class ProjectService {
    async create(project) {
        await projectDao.save(project)
    }

    async getProject(id) {
        return projectDao.getProject(id)
    }

    async search(keyword, page, count) {
        return await projectDao.search(keyword, page, count)
    }
}

module.exports = exports = new ProjectService();
