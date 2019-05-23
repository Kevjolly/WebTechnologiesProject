const projectDao = require('../dao/project-dao')
const userDao = require('../dao/user-dao')

class ProjectService {
    async create(project) {
        project.users = new Array();
        project.users.push(project.creator);

        await projectDao.save(project)

        await userDao.joinProject(project.creator, project.id)
    }

    async update(projectId, project) {
        await projectDao.update(projectId, project)
    }

    async getProject(id) {
        const users = await userDao.getProjectUsers(id)
        const project = await projectDao.getProject(id)

        var creator;
        for (var i = 0; i < users.length; i++) {
            if (users[i].email == project.creator) {
                creator = users[i];
                break;
            }
        }

        return {
            project: project,
            users: users,
            creator: creator
        }
    }

    async getProjects(projects) {
        return await projectDao.getProjects(projects);
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
