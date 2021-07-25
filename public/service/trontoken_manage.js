var datatables = $('#trontokens').DataTable({
    'paging': true,
    'lengthChange': true,
    'searching': false,
    'info': true,
    'ajax': '/trontokens/load',
    'autoWidth': true,
    "ordering": false,
    "columns": [
        {
            "data": "id",
            "render": function (data, type, full, meta) {
                return '<input type="checkbox" name="id_' + data + '" value="' + data + '">';
            }
        },
        {"data": "tokenname"},
        {"data": "tokensymbol"},
        {"data": "tokencontract"},
        {"data": "tokenpair"},
        {"data": "tokensupply"},
        {"data": "tokendicimal"},
        {"data": "tokenblockid"},
        {"data": "tokenhash"},
        {"data": "tokencreator"},
        {"data": "createtime"},
        {"data": "updatetime"},
        {"data": "deletetime"},
        {"data": "is_del"},
        {
            "data": "is",
            render: function (data, type, row, meta) {
                return '<a class="" data-toggle="modal" id="id_' + row.id + '" data-target="#e-dialog-token" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-edit icon-white"></i> 编辑</a>&nbsp;&nbsp;<a data-toggle="modal" onclick="removeData(' + row.id + ')" data-target="#dialog_user_delete" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-remove icon-white"></i> 删除</a>'
            }
        }
    ],
    "language": {
        "emptyTable": "没有结果可以显示",
        "info": "正在显示第 _START_ 到 _END_ 条数据（共 _TOTAL_ 条）",
        "infoEmpty": "没有数据",
        "infoFiltered": "(已从 _MAX_ 条数据中过滤)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "显示 _MENU_ 条",
        "loadingRecords": "加载中...",
        "processing": "处理中...",
        "search": "搜索角色名称：",
        "zeroRecords": "没有匹配的数据",
        "paginate": {
            "first": "第一页",
            "last": "最后一页",
            "next": "下一页",
            "previous": "上一页"
        }
    },
    "serverSide": true
});
//编辑
$('#e-dialog-token').on('show.bs.modal', function (event) {
    var modal = $(this);
    var button = $(event.relatedTarget);// Button that triggered the modal
    var data = button.data('whatever'); // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    initForm(modal, data);
});
var initForm = function (modal, data) {
    if (data) {
        modal.find('.modal-body input#e_id').val(data.id);
        modal.find('.modal-body input#e_tokenname').val(data.tokenname);
        modal.find('.modal-body input#e_tokensymbol').val(data.tokensymbol);
        modal.find('.modal-body input#e_tokencontract').val(data.tokencontract);
        modal.find('.modal-body input#e_tokenpair').val(data.tokenpair);
        modal.find('.modal-body input#e_tokensupply').val(data.tokensupply);
        modal.find('.modal-body input#e_tokendicimal').val(data.tokendicimal);
        modal.find('.modal-body input#e_tokenblockid').val(data.tokenblockid);
        modal.find('.modal-body input#e_tokenhash').val(data.tokenhash);
    } else {
        modal.find('.modal-body form input').val("");
    }
};
$('#e-dialog-token').find('.modal-footer #saveToken').click(function () {
    $.ajax({
        type: "get",
        url: "/trontokens/save",
        asyc: false,
        data: $("#e-token-form").serialize(),
        error: function (error) {
            new Noty({
                type: 'error',
                layout: 'topCenter',
                text: '内部错误，请稍后再试',
                timeout: '5000'
            }).show();
        },
        success: function (result) {
            if (result.error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: result.msg || '保存角色失败',
                    timeout: '2000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: result.msg || '保存成功',
                    timeout: '2000'
                }).show();
                $('#e-dialog-token').modal('hide');
                datatables.ajax.url('/trontokens/load').load();
            }
        }
    });
});
$("#token_refresh").on("click", function () {
    datatables.ajax.url('/trontokens/load').load();
});
$("#token_edit").on("click", function () {
    var ids = getIds();
    if (ids.length != 1) {
        new Noty({
            type: 'warning',
            layout: 'topCenter',
            text: '请选择一条记录',
            timeout: '2000'
        }).show();
        return;
    }
    var id = ids[0];
    var data = $("a#id_" + id).attr("data-whatever");
    var modal = $('#e-dialog-token');
    $('#e-dialog-token').modal({
        keyboard: true
    });
    initForm(modal, JSON.parse(data));
});


var deleteTokenData = function (ids) {
    $.ajax({
        type: "delete",
        url: "/trontokens/delete",
        asyc: false,
        data: {ids: ids},
        error: function (error) {
            new Noty({
                type: 'error',
                layout: 'topCenter',
                text: '内部错误，请稍后再试',
                timeout: '5000'
            }).show();
        },
        success: function (result) {
            if (result.error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: result.msg || '删除token失败',
                    timeout: '2000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: result.msg || '删除token成功',
                    timeout: '2000'
                }).show();
                datatables.ajax.url('/trontokens/load').load();
            }
        }
    });
};
//批量删除
$("#token_batch_remove").on("click", function () {
    var ids = getIds();
    if (ids.length == 0) {
        new Noty({
            type: 'warning',
            layout: 'topCenter',
            text: '至少要选择一条记录',
            timeout: '2000'
        }).show();
        return;
    }
    removeData(ids.join(","));
});
var removeData = function (id) {
    var n = new Noty({
        text: '你要继续吗?',
        type: 'info',
        closeWith: ['button'],
        layout: 'topCenter',
        buttons: [
            Noty.button('YES', 'btn btn-success', function () {
                deleteTokenData(id);
                n.close();
            }, {id: 'button1', 'data-status': 'ok'}),

            Noty.button('NO', 'btn btn-error btn-confirm', function () {
                n.close();
            })
        ]
    }).show();
};
