// zeroDupTabs.js
// Created by kamatari

// TODO
// [__] 固定tabにしているとmoveできない
// [__] removeしたタブをactiveにする
// [__] extensionを有効にした時点でduplicateがあった場合のerror処理
// [__] tabのindexが変わったら更新しないといけない

var MaxTabArrayNum	= 9999;
var stockTabsCount	= 0;
var openedTabArray	= new Array();
var closedTabArray	= new Array();

// extension が有効になった時点で開いているtabの情報をstock
if (openedTabArray.length == 0) {
	chrome.windows.getAll({"populate" : true}, setAllTabInfo);
}

// 新しくtabを開いた時と更新された時のurlをstock
chrome.tabs.onUpdated.addListener(
	function(updateTabId, changeInfo, tab) {
		if (changeInfo.url != null) {
			openedTabArray[updateTabId] = changeInfo.url;
			checkLengthAndArrayShift(openedTabArray);
		}
        // extension のメイン機能、tabが被ってたら閉じてmoveしてactiveにする機能
        for (key in openedTabArray) {
                //console.log('outer stock url ' + openedTabArray[key]['url']);
            if (openedTabArray[key].url === changeInfo.url) {
                //console.log('stock url ' + openedTabArray[key]['url']);
                //chrome.tabs.remove(updateTabId);
                //chrome.tabs.move(parseInt(key), {'index':-1});
                //console.log('updateTabId ' + updateTabId)
                //console.log('highlight '+ openedTabArray[key]['index']);
                if (openedTabArray[key]['index'] != null) {
                    chrome.tabs.highlight({tabs: [openedTabArray[key]['index']]},function(){});
                }
            }
        }

	}
);

/*
// 閉じたタブのurlを削除しなければ
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
			openedTabArray[AllTabInfo[i]['tabs'][j].id] =
            {
                'url'   :   AllTabInfo[i]['tabs'][j].url,
                'index' :   AllTabInfo[i]['tabs'][j].index
            };
    console.log('setAlltabInfo '+openedTabArray[AllTabInfo[i]['tabs'][j].id]['url']);
    console.log('setAlltabInfo '+openedTabArray[AllTabInfo[i]['tabs'][j].id]['index']);
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
