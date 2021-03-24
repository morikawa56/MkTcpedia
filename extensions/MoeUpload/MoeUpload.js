$(function() {
    var i18nStrings = {
        "zh-hans": {
            forManagementOnly: "仅供管理使用",
            pageInsteadOfImg: "建议您在此处输入页面地址，而非文件链接。",
            sameAsSourceURL: "您输入的源地址与文件的来源地址相同，建议您在此处输入页面地址，而非文件链接。",
            noFile: "您既未选择文件也未输入来源地址，请检查。",
            noDetail: "＞_＜ 【人物名、作者名、源地址】不能全部为空~！",
            haveSymbol: "＞_＜ 【人物名、作者名、源地址】不能包含特殊符号~！请不要写多余的内容 [·~。（）()!@#$%^&*]",
        },
        "zh-hant": {
            forManagementOnly: "僅供管理使用",
            pageInsteadOfImg: "建議您在此處輸入頁面地址，而非檔案連結。",
            sameAsSourceURL: "您輸入的源地址與檔案的來源 URL 相同，建議您在此處輸入頁面地址，而非檔案連結。",
            noFile: "您既未選擇檔案也未輸入地址，請檢查。",
            noDetail: "＞_＜ 【人物名、作者名、源地址】不能全部為空~！",
            haveSymbol: "＞_＜ 【人物名、作者名、源地址】不能包含特殊符號~！請不要寫多餘的內容 [·~。（）()!@#$%^&*]",
        },
        "en": {
            forManagementOnly: "For management only",
            pageInsteadOfImg: "We recommend that you enter the page address here instead of a link to the file.",
            sameAsSourceURL: "The Origin Source URL you entered is the same as the Source URL above, we recommend that you enter the page address here instead of a link to the file.",
            noFile: "You have neither selected a file nor entered an source URL. Please check.",
            noDetail: "＞_＜ Character name, Author, Origin Source URL cannot all be empty~!",
            haveSymbol: "＞_＜ Character name, Author, Origin Source URL cannot contain special symbols~! [·~。（）()!@#$%^&*]"
        }
    };
    var zhLanguage = {
        simplified: ["zh", "zh-cn", "zh-hans", "zh-my", "zh-sg"],
        tranditional: ["zh-hant", "zh-hk", "zh-mo", "zh-tw"]
    };
    var userLanguage = mw.config.get("wgUserLanguage") || "en";
    switch (true) {
        case userLanguage.startsWith("zh"):
            if (zhLanguage.simplified.includes(userLanguage)) {
                userLanguage = "zh-hans";
            } else {
                userLanguage = "zh-hant";
            }
            break;
        case userLanguage.startsWith("en"):
            userLanguage = "en";
            break;
        default:
            userLanguage = "en";
            break;
    }
    var i18n = function(key) {
        return i18nStrings[userLanguage][key] || i18nStrings.en[key] || key;
    };
    var wpUploadDescription = $("#wpUploadDescription");
    if (wpUploadDescription.length > 0) {
        var toggleLink = $("<a/>");
        toggleLink.attr("href", "javascript:void(0);").text(i18n("forManagementOnly")).on("click", function() {
            wpUploadDescription.slideToggle();
            return false;
        });
        wpUploadDescription.hide();
        $('.mw-htmlform-field-HTMLTextAreaField .mw-input').prepend(toggleLink);
    }
    var errorP = $("<p/>").addClass("error");
    var uploadFormMsgRow = $("<tr/>").addClass("error uploadFormMsg");
    var uploadFormMsgCol = $("<td/>").attr("colspan", "2");
    uploadFormMsgRow.append(uploadFormMsgCol);
    /*url输入验证*/
    var wpSrcUrl = $('#wpSrcUrl');
    var upLoadFileUrlmsg = uploadFormMsgRow.clone().removeClass("uploadFormMsg").hide();
    wpSrcUrl.closest("tr").after(upLoadFileUrlmsg);
    wpSrcUrl.on("change blur", function() {
        var str = wpSrcUrl.val().trim();
        if (/\.(?:ogg|ogv|oga|flac|opus|wav|webm|mp3|png|gif|jpg|jpeg|webp|svg|pdf|ppt|jp2|doc|docx|xls|xlsx|psd|sai|swf|mp4)$/i.test(str)) {
            upLoadFileUrlmsg.show().find("td").text(i18n("pageInsteadOfImg"));
        } else if ($("#wpUploadFileURL").val() === str) {
            upLoadFileUrlmsg.show().find("td").text(i18n("sameAsSourceURL"));
        } else {
            upLoadFileUrlmsg.hide();
        }
    });
    /* XpAhH同学写的上传页面检测，未写注释禁止上传。管理员，巡查员不检测 */
    $.extend($.easing, {
        easeOutCirc: function(x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        }
    });
    var uploadForm = $("#mw-upload-form");
    uploadForm.on("submit", function() {
        uploadForm.find(".inputError").removeClass("inputError");
        uploadForm.find(".uploadFormMsg").remove();
        var wgUserGroups = mw.config.get("wgUserGroups");
        if (wgUserGroups.incldes("sysop") || wgUserGroups.incldes("patroller") || mw.util.getParamValue("disableUploadCheck") === "true") {
            return true;
        }
        var returnValue = true;
        var ifHaveFile = $($('input[name="wpSourceType"]:checked').val() == "url" ? "#wpUploadFileURL" : "#wpUploadFile").val() !== "";
        if (!ifHaveFile) {
            $("#mw-htmlform-source").parent().before(errorP.clone().addClass("uploadFormMsg").text(i18n("noFile")));
            returnValue = false;
        }
        //三选一
        var haveNoDetail = $("#wpCharName, #wpAuthor, #wpSrcUrl").filter(function() { return $(this).val().length === 0; });
        if (haveNoDetail.length > 0) {
            haveNoDetail.addClass("inputError");
            var noDetailRow = uploadFormMsgRow.clone();
            noDetailRow.find("td").text(i18n("noDetail"));
            haveNoDetail.first().closest("tr").before(noDetailRow);
            returnValue = false;
        }
        //符号
        var haveSymbol = $("#wpCharName, #wpAuthor, #wpSrcUrl").filter(function() { return /[·~。（）()!@#$%^&*]/.test($(this).val()); });
        if (haveSymbol.length > 0) {
            haveSymbol.addClass("inputError");
            var haveSymbolRow = uploadFormMsgRow.clone();
            haveSymbolRow.find("td").text("haveSymbol");
            haveSymbol.first().closest("tr").before(haveSymbolRow);
            returnValue = false;
        }
        /*url提交验证*/
        if (upLoadFileUrlmsg.is(":visible")) {
            returnValue = false;
        }
        $('html,body').animate({
            scrollTop: uploadForm.find(".uploadFormMsg").first().offset().top - 48
        }, 0);
        uploadForm.find(".uploadFormMsg");
        if (!returnValue) {
            var body = $("body");
            for (var i = 0; i < 20; i++) {
                body.append(
                    $("<div/>").text("萌").css({
                        color: "#3FFC2E",
                        "font-size": 54 + 30 * Math.random(),
                        position: "fixed",
                        left: screen.availWidth * Math.random(),
                        top: screen.availHeight * Math.random()
                    }).animate(
                        //
                        {
                            opacity: 0.2,
                            "font-size": 54 + 80 * Math.random(),
                            left: screen.availWidth * Math.random(),
                            top: -100 - Math.random() * 300
                        },
                        2000,
                        "easeOutCirc",
                        function() {
                            this.remove();
                        }
                    )
                );
            }
        }
        return returnValue;
    });
});
