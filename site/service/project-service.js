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
        var keywords = query.keyword.trim().split(" ");
        
        console.log('project search keywords', keywords)

        var result = await projectDao.search(keywords, query.page, query.count)
        result.keyword = query.keyword
        result.page = query.page
        result.type = 'project'

        for (var i = 0; i < result.projects.length; i++) {
            result.projects[i].creator = await userDao.getUser(result.projects[i].creator, ['nickname', 'image', 'email'])
        }

        console.log('project search result', result.projects)

        return result
    }

    async join(email, projectId) {
        return await userDao.joinProject(email, projectId)
    }

    async quit(email, projectId) {
        // TODO remove from project members
        return await userDao.quitProject(email, projectId)
    }

    async agree(applicant, projectId) {
        // TODO add to project members
        return await userDao.joinProject(applicant, projectId)
    }
}

module.exports = exports = new ProjectService();
