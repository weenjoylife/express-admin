const express = require('express');
const mysql = require('../core/mysql');
const log = require('../core/logger').getLogger("system");
const router = express.Router();
const _ = require('lodash');
const common = require('../core/common');
var moment = require("moment");

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('trontoken', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/trontokens'] || {},
        // permissions: permissions,
        title: '波场tokens',
        router: '/trontokens'
    });
});
router.get('/load', async(req, res, next) => {
    var sqlcount = "select count(*) count from bs_trontoken where is_del=0";
    var sql = "select * from bs_trontoken where is_del=0";

    var start = req.query.start;
    var length = req.query.length;
    var draw = req.query.draw;
    if (!start || !draw || !length) {
        res.status(401).json("invoke error!");
        return;
    }

    start = parseInt(start) || 0;
    length = parseInt(length) || 0;
    draw = parseInt(draw) || 0;

    var search = req.query.search;
    if (search) {
        sqlcount = sqlcount + " and tokenname like '%" + search.value + "%'";
        sql = sql + " and tokenname like '%" + search.value + "%'"
    }

    var memuCount = await mysql.query(sqlcount);
    sql = sql + " ORDER BY id DESC limit " + start + "," + length;
    var result = await mysql.query(sql);
    // console.log(result);
    var backResult = {
        draw: draw,
        recordsTotal: memuCount['0']['count'],
        recordsFiltered: memuCount['0']['count'],
        data: []
    };
    for (var i in result) {
        backResult.data.push({
            id: result[i].id,
            is:result[i].id + "_",
            tokenname: result[i].tokenname,
            tokensymbol: result[i].tokensymbol,
            tokencontract: result[i].tokencontract,
            tokenpair: result[i].tokenpair,
            tokensupply: result[i].tokensupply,
            tokendicimal: result[i].tokendicimal,
            tokenblockid: result[i].tokenblockid,
            tokenhash: result[i].tokenhash,
            tokencreator: result[i].tokencreator,
            createtime: result[i].createtime,
            updatetime: result[i].updatetime,
            deletetime: result[i].deletetime,
            is_del: result[i].is_del
        });
    }
    res.status(200).json(backResult);
});
router.get('/save', async(req, res, next) => {
    var result = {
        error: 0,
        msg: ""
    };
    try {
        var user = req.session.user;
        log.info("toekn save params: ", req.query);
        var e_id = req.query.e_id;
        var e_tokenname = req.query.e_tokenname;
        var e_tokensymbol = req.query.e_tokensymbol;
        var e_tokencontract = req.query.e_tokencontract;
        var e_tokenpair = req.query.e_tokenpair;
        var e_tokensupply = req.query.e_tokensupply;
        var e_tokendicimal = req.query.e_tokendicimal;
        var e_tokenblockid = req.query.e_tokenblockid;
        var e_tokenhash = req.query.e_tokenhash;

        if (e_tokenname == "" || e_tokenname.trim() == "") {
            result.msg = "角色不能为空";
        }
        if (result.msg != "") {
            result.error = 1;
        } else {
            var ret, sql;
            if (e_id) {
                sql = "update bs_trontoken set tokenname=?,tokensymbol=?,tokencontract=?,tokenpair=?,tokensupply=?,tokendicimal=?,tokenblockid=?,tokenhash=?,updatorid=?, updatetime=? where id=?";
                var params = [e_tokenname, e_tokensymbol,e_tokencontract,e_tokenpair,e_tokensupply,e_tokendicimal,e_tokenblockid,e_tokenhash, user.id, new Date(), e_id];
                ret = await mysql.query(sql, params);
                await common.saveOperateLog(req, "更新token：" + e_tokenname + ";ID: " + e_id);
            } else {
                sql = "select * from bs_trontoken where tokenname=? and is_del=0";
                // var users = await mysql.query(sql, e_tokenname);
                // if (users.length > 0) {
                //     result.error = 1;
                //     result.msg = "角色名已经存在！";
                // } else {
                //     sql = "insert into bs_trontoken(tokenname, tokensymbol,tokencontract,tokenpair,tokensupply,tokendicimal,tokenblockid,tokenhash) values (?,?,?,?,?,?,?,?)";
                //     ret = await mysql.query(sql, [e_tokenname, e_tokensymbol,e_tokencontract,e_tokenpair,e_tokensupply,e_tokendicimal,e_tokenblockid, e_tokenhash]);
                //     await common.saveOperateLog(req, "新增角色名称：" + tokenname);
                // }
                sql = "insert bs_trontoken(tokenname, tokensymbol,tokencontract,tokenpair,tokensupply,tokendicimal,tokenblockid,tokenhash) values (?,?,?,?,?,?,?,?)";
                ret = await mysql.query(sql, [e_tokenname, e_tokensymbol,e_tokencontract,e_tokenpair,e_tokensupply,e_tokendicimal,e_tokenblockid, e_tokenhash]);
                await common.saveOperateLog(req, "新增token：" + e_tokenname);
            }
            log.info("save token ret: ", ret);
        }
        res.status(200).json(result);
    } catch (e) {
        log.error("save token ret:", e);
        result.error = 1;
        result.msg = "保存失败，请联系管理员";
        res.status(200).json(result);
    }
});
router.delete('/delete', async(req, res, next) => {
    var result = {
        error: 0,
        msg: ""
    };
    var conn = await mysql.getConnection();
    await mysql.beginTransaction(conn);
    try {
        var user = req.session.user;
        log.info("delete token params: ", req.body);
        var ids = req.body.ids;
        if (ids && ids.trim() != "") {
            ids = ids.split(",");
            // var sql = 'delete from bs_menu_role where role_id in (';
            // var sql2 = 'delete from bs_user_role where role_id in (';
            // var sql3 = 'update bs_role set is_del=1, modified_at=?, modified_id=? where role_id in (';
            var sql = 'update bs_trontoken set is_del= 1,deletetime=?,updatorid=? where id in (';
            for (var i = 0; i < ids.length; i++) {
                if (i == 0) {
                    sql = sql + ids[i];
                } else {
                    sql = sql + "," + ids[i];
                }
            }
            sql = sql + ")";
            // sql2 = sql2 + ")";
            // sql3 = sql3 + ")";
            // await mysql.query2(conn, sql);
            // await mysql.query2(conn, sql2);
            // await mysql.query2(conn, sql3, [new Date(), user.id]);

            await mysql.query2(conn, sql, [new Date(), user.id]);

            await mysql.commit(conn);
            await common.saveOperateLog(req, "删除tokenID: " + ids);
        } else {
            result.error = 1;
            result.msg = "删除失败，必须选择一项";
            await mysql.rollback(conn);
        }
    } catch (e) {
        log.error("delete token ret:", e);
        result.error = 1;
        result.msg = "删除失败，请联系管理员";
        await mysql.rollback(conn);
    }
    res.status(200).json(result);
});
module.exports = router;
