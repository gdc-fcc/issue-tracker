const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("issues.db");

const random_id = (length = 19) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = "";
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const required_string = (str, reject) => {
    if (typeof str !== "string" || str === "") {
        reject('required field(s) missing');
    }
    return str;
}

const optional_string = (str, reject) => {
    if (str === null || str === undefined) {
        return ""
    }
    if (typeof str !== "string") {
        reject('bad optional fields');
    }
    return str;
}

const add_issue = (project, body) => {
    return new Promise((resolve, reject) => {
        const now = (new Date()).toISOString();
        const issue = {
            _id: random_id(),
            project: project,
            issue_title: required_string(body.issue_title, reject),
            issue_text: required_string(body.issue_text, reject),
            created_on: now,
            updated_on: now,
            created_by: required_string(body.created_by, reject),
            assigned_to: optional_string(body.assigned_to, reject),
            open: true,
            status_text: optional_string(body.status_text, reject),
        }
        const keys = Object.keys(issue).join(",");
        const vals = Object.values(issue);
        const sql = `INSERT INTO issues(${keys}) VALUES (${vals.map(x => "?").join(",")})`
        db.run(sql, vals, (_res, err) => err ? reject(err) : resolve(issue));
    })
}

const get_issues = (project, query) => {
    return new Promise((resolve, _reject) => {
        const conditions = [['project', project]]
        for (const prop of ['_id', 'isse_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open']) {
            check_param(query, prop, conditions)
        }
        const sql = `SELECT * FROM issues WHERE ${conditions.map(x => x[0] + "=?").join(" AND ")}`;
        const params = [...conditions.map(x => x[1])];
        db.all(sql, params, (_error, rows) => {
            rows.forEach(row => row.open = row.open === 'true')
            resolve(rows)
        })
    })
}

const delete_issue = (project, _id) => {
    return new Promise((resolve, reject) => {
        if (typeof _id !== "string") {
            reject('missing _id')
        }
        db.run("DELETE FROM issues WHERE _id=$_id AND project=$project", { $_id: _id, $project: project }, function (err, _) {
            if (this.changes === 0 || err) {
                reject('could not delete')
            } else {
                resolve('successfully deleted')
            }
        })
    })
}

const check_param = (body, prop, conditions) => {
    if (typeof body[prop] === 'string')
        conditions.push([prop, body[prop]])
}

const patch_issue = (project, body) => {
    return new Promise((resolve, reject) => {
        const conditions = [];
        const id = body._id;
        if (typeof id != "string") {
            reject({ error: 'missing _id' })
        }
        if (typeof body.open == "boolean") {
            conditions.push(["open",  body.open])
        }
        for (const prop of ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open']) {
            check_param(body, prop, conditions)
        }
        if (conditions.length === 0) {
            reject({ error: 'no update field(s) sent', _id: id })
        }
        conditions.push(["updated_on", (new Date()).toISOString()]);
        const sql = `UPDATE issues SET ${conditions.map(x => x[0] + "=?").join(",")} WHERE _id=? AND project=?`;
        params = [...conditions.map(x => x[1]), id, project];
        db.run(sql, params, function (err) {
            if (this.changes === 0 || err !== null) {
                reject({ error: 'could not update', _id: id })
            } else {
                resolve({ result: 'successfully updated', _id: id });
            }
        })
    })
}

module.exports = {
    add_issue,
    get_issues,
    delete_issue,
    patch_issue
}