// zeroDupTabs.js
// Created by kamatari

var MaxTabArrayNum	= 9999;
var stockTabsCount	= 0;
var openedTabArray	= new Array();
var closedTabArray	= new Array();

// extensionが有効になった時点で開いているtabの情報をstock
if (openedTabArray.length == 0) {
	chrome.windows.getAll({"populate" : true}, setAllTabInfo);
}

// 新しくtabを開いた時と更新された時のurlをstock
// 固定タブにしてるとmoveできない
// moveしたtabをactiveにしたい
// extension を有効にした時点でduplicateがあった場合のerror処理
chrome.tabs.onUpdated.addListener(
	function(updateTabId, changeInfo) {
        for (key in openedTabArray) {
            if (openedTabArray[key] === changeInfo.url) {
                console.log(changeInfo.url);
                console.log(key);
                chrome.tabs.remove(updateTabId);
                chrome.tabs.move(parseInt(key), {'index':-1});
            }
        }
		if (changeInfo.url != null) {
			openedTabArray[updateTabId] = changeInfo.url;
			checkLengthAndArrayShift(openedTabArray);
		}
	}
);

/*
// 閉じたtabのurlをopentabから削除しなければ。
chrome.tabs.onRemoved.addListener(
	function(closedTabId) {
		if (openedTabArray[closedTabId] != null) {
			closedTabArray.push(openedTabArray[closedTabId]);
			checkLengthAndArrayShift(closedTabArray);
		}
	}
);
*/

// extensionのアイコンをclickで,stockしてあるurlで新規tabを作成
chrome.browserAction.onClicked.addListener(
	function() {
		if (closedTabArray.length > 0) {
			chrome.tabs.create({"url" : closedTabArray.pop(),"selected":false});
		}
	}
);


function setAllTabInfo(AllTabInfo) {
	for (var i=0; i<AllTabInfo.length; i++) {
		for (var j=0; j<AllTabInfo[i]['tabs'].length; j++) {
			openedTabArray[AllTabInfo[i]['tabs'][j].id] = AllTabInfo[i]['tabs'][j].url;
		}
	}
}

function checkLengthAndArrayShift(urlArray) {
	var arrayCount = countLength(urlArray);
	if (arrayCount > MaxTabArrayNum) {
		for (key in urlArray) {
			delete urlArray[key];
			arrayCount--;
			if (arrayCount <= MaxTabArrayNum) {break;}
		}
	}
}

function countLength(inputArray) {
	var count = 0;
	for (var key in inputArray) { count++; }
	return count;
}
