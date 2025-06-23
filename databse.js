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

const required_string = str => {
    if (typeof str !== "string" || str === "") {
        throw Error('required field(s) missing');
    }
    return str;
}

const optional_string = str => {
    if (str === null || str === undefined) {
        return ""
    }
    if (typeof str !== "string") {
        throw Error('bad optional fields');
    }
    return str;
}

const add_issue = (project, body) => {
    const now = (new Date()).toISOString();
    const issue = {
        _id: random_id(),
        project: project,
        issue_title: required_string(body.issue_title),
        issue_text: required_string(body.issue_text),
        created_on: now,
        updated_on: now,
        created_by: required_string(body.created_by),
        assigned_to: optional_string(body.assigned_to),
        open: true,
        status_text: optional_string(body.status_text),
    }
    const keys = Object.keys(issue).join(", ");
    const vals = Object.values(issue).map(x => `'${x}'`).join(", ");
    const sql = `INSERT INTO issues(${keys}) VALUES (${vals})`
    // async error handleing :(
    db.run(sql, /*(res, err) => console.log({ res, err })*/);
    return issue;
}

const get_issues = (project, res, req) => {
    const conditions = [`project='${project}'`]
    for (const prop of ['_id', 'isse_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open']) {
        check_param(req.query, prop, conditions)
    }
    db.all(`SELECT * FROM issues WHERE ${conditions.join(" AND ")}`, (_error, rows) => {
        //console.log({ error, rows });
        rows.forEach(row => row.open = row.open === 'true')
        res.json(rows)
    })
}

const delete_issue = (project, res, _id) => {
    console.log({ action: 'delete', project, _id })
    if (typeof _id !== "string") {
        res.json({ error: 'missing _id' })
        return;
    }
    db.run("DELETE FROM issues WHERE _id=$_id AND project=$project", { $_id: _id, $project: project }, function (err, _) {
        console.log({ _, err, th: this })
        if (this.changes === 0 || err) {
            res.json({ error: 'could not delete', _id })
        } else {
            res.json({ result: 'successfully deleted', _id })
        }
    })
}

const check_param = (body, prop, conditions) => {
    if (typeof body[prop] === 'string')
        conditions.push(`${prop} = '${body[prop]}'`)
}

const patch_issue = (project, res, body) => {
    const conditions = [];
    const id = body._id;
    if (typeof id != "string") {
        res.json({ error: 'missing _id' })
        throw Error('missing_id');
    }
    if (typeof body.open == "boolean") {
        conditions.push(`open = '${body.open}'`)
    }
    for (const prop of ['issue_title', 'issue_text', 'created_by', 'ssigned_to', 'status_text', 'open']) {
        check_param(body, prop, conditions)
    }
    if (conditions.length === 0) {
        res.json({ error: 'no update field(s) sent', _id: id })
        throw Error('no update field(s) sent')
    }
    conditions.push(`updated_on = '${(new Date()).toISOString()}'`);
    const sql = `UPDATE issues SET ${conditions.join(", ")} WHERE _id='${id}' AND project='${project}'`;
    db.run(sql, {}, function (err, suc) {
        //console.log({err, suc, th: this}); //res.json(err)
        if (this.changes === 0 || err !== null) {
            res.json({ error: 'could not update', _id: id })
        } else {
            res.json({ result: 'successfully updated', _id: id });
        }
    })
}

module.exports = {
    add_issue,
    get_issues,
    delete_issue,
    patch_issue
}