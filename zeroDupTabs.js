// zeroDupTabs.js
// Created by kamatari

var MaxTabArrayNum	= 10000;
var openedTabArray	= new Array();

// extension が有効になった時点で開いているtabの情報をstock
if (openedTabArray.length == 0) {
	chrome.windows.getAll({"populate" : true}, setAllTabInfo);
}

chrome.tabs.onUpdated.addListener(
    function(updateTabId, changeInfo, tabInfo) {
        //console.log('* here is updated function');
        for (key in openedTabArray) {
            // すでに開いているurlが新規で開かれた時,removeしてすでに開いている方をactiveにする
            if (openedTabArray[key].url === changeInfo.url) {
                //console.log('* remove url '+openedTabArray[updateTabId]);
                chrome.tabs.remove(updateTabId);
                console.log('array ?? windowid '+[openedTabArray[key]['windowId']]);
                if (openedTabArray[key].index != null) {
                    chrome.tabs.highlight({
                        tabs    : openedTabArray[key]['index'],
                        windowId: openedTabArray[key]['windowId']
                    },function(){});
                }
            }
        }
        // 開いた状態になっているurlとそのindexを保存 (newtabは除外)
		if (changeInfo.url != null && changeInfo.url != 'chrome://newtab/') {
			openedTabArray[updateTabId] = {
                'url'       :   changeInfo.url,
                'index'     :   tabInfo.index,
                'windowId'  :   tabInfo.windowId
            };
            //console.log('* add url to memory '+changeInfo.url);
			checkLengthAndArrayShift(openedTabArray);
		}
	}
);

// 新規tabが生成された時
chrome.tabs.onCreated.addListener(
    function(createdTab) {
        //console.log('* here is created function');
        if (createdTab.url != null && createdTab.url != 'chrome://newtab/') {
            for (key in openedTabArray) {
                // 新規tabよりindexが大きいtabが存在した時、indexをひとつずらす
                if ((createdTab.windowId == openedTabArray[key].windowId) && (createdTab.index <= openedTabArray[key].index)) {
                    openedTabArray[key].index = openedTabArray[key].index + 1;
                    //console.log('* increment index '+openedTabArray[key].url);
                }
            }
        }
    }
);

// tabを移動させた時
chrome.tabs.onMoved.addListener(
    function(movedTabId, moveInfo) {
        if (moveInfo.toIndex < moveInfo.fromIndex) {
            for (key in openedTabArray) {
                if ((moveInfo.toIndex <= openedTabArray[key].index) && (openedTabArray[key].index < moveInfo.fromIndex)) {
                    openedTabArray[key].index = openedTabArray[key].index + 1;
                    //console.log('* increment index '+openedTabArray[key].url);
                }
            }
        } else {
            for (key in openedTabArray) {
                if ((moveInfo.fromIndex < openedTabArray[key].index) && (openedTabArray[key].index <= moveInfo.toIndex)) {
                    openedTabArray[key].index = openedTabArray[key].index - 1;
                    //console.log('* decrement index '+openedTabArray[key].url);
                }
            }
        }
        openedTabArray[movedTabId].index = moveInfo.toIndex;
    }
);

// windowからtabを切り離したとき
chrome.tabs.onDetached.addListener(
    function(detachedTabId, detachInfo) {
       //console.log('* onDetached oldWindowId '+detachInfo.oldWindowId+' oldPosition '+detachInfo.oldPosition);
    }
);

// tabを新しいwindowに移したとき
chrome.tabs.onAttached.addListener(
    function(atachedTabId, attachInfo) {
       //console.log('* onAtached newWindowId '+attachInfo.newWindowId+' newPosition '+attachInfo.newPosition);
    }
);

// 閉じたタブのurlを削除
chrome.tabs.onRemoved.addListener(
	function(closedTabId, removeInfo) {
		if (openedTabArray[closedTabId] != null) {
            for(key in openedTabArray){
                if((removeInfo.windowId == openedTabArray[closedTabId].windowId) && (openedTabArray[closedTabId].index < openedTabArray[key].index)) {
                    openedTabArray[key].index = openedTabArray[key].index - 1;
                    //console.log('* decrement index '+openedTabArray[key].url);
                }
            }
            //console.log('* close url '+openedTabArray[closedTabId].url);
			delete openedTabArray[closedTabId];
		}
	}
);


function setAllTabInfo(AllTabInfo) {
	for (var i=0; i<AllTabInfo.length; i++) {
		for (var j=0; j<AllTabInfo[i]['tabs'].length; j++) {
            // 新規タブは除外
            if (AllTabInfo[i]['tabs'][j].url == 'chrome://newtab/'){ continue; }
            // urlとindexをsetにして保存
			openedTabArray[AllTabInfo[i]['tabs'][j].id] = {
                'url'       :   AllTabInfo[i]['tabs'][j].url,
                'index'     :   AllTabInfo[i]['tabs'][j].index,
                'windowId'  :   AllTabInfo[i]['tabs'][j].windowId
            };
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
