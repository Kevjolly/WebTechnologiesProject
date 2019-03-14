const projectDao = require('../dao/project-dao')
const userDao = require('../dao/user-dao')

class ProjectService {
    async create(project) {
        var projectId = new Date().getTime()
        project.id = projectId

        await projectDao.save(project)

        await userDao.joinProject(project.creator, projectId)
    }

    async getProject(id) {
        const users = await userDao.getProjectUsers(id)
        const project = await projectDao.getProject(id)

        return {
            project: project,
            users: users
        }
    }

    async search(query) {
        return await projectDao.search(query.keyword, query.page, query.count)
    }

    async join(email, projectId) {
        return await userDao.joinProject(email, projectId)
    }

    async quit(email, projectId) {
        return await userDao.quitProject(email, projectId)
    }

    async agree(applicant, projectId) {
        return await userDao.joinProject(applicant, projectId)
    }
}

module.exports = exports = new ProjectService();
