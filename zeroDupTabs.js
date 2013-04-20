// zeroDupTabs.js
// Created by kamatari

var MaxTabArrayNum	= 10000;
var openedTabArray	= new Array();
var closedTabArray	= new Array();

// extension ��ͭ���ˤʤä������ǳ����Ƥ���tab�ξ����stock
if (openedTabArray.length == 0) {
	chrome.windows.getAll({"populate" : true}, setAllTabInfo);
}

chrome.tabs.onUpdated.addListener(
	function(updateTabId, changeInfo, tabInfo) {
        for (key in openedTabArray) {
            // ���Ǥ˳����Ƥ���url�������ǳ����줿��,remove���Ƥ��Ǥ˳����Ƥ�������
            if (openedTabArray[key].url === changeInfo.url) {
                chrome.tabs.remove(updateTabId);
                if (openedTabArray[key].index != null) {
                    chrome.tabs.highlight({tabs: [openedTabArray[key]['index']]},function(){});
                }
            }
        }
        // ���������֤ˤʤäƤ���url�Ȥ���index����¸
		if (changeInfo.url != null) {
			openedTabArray[updateTabId] = {
                'url'   :   changeInfo.url,
                'index' :   tabInfo.index
            };
			checkLengthAndArrayShift(openedTabArray);
		}
	}
);

// �Ĥ������֤�url����
chrome.tabs.onRemoved.addListener(
	function(closedTabId) {
		if (openedTabArray[closedTabId] != null) {
			delete openedTabArray[closedTabId];
		}
	}
);


function setAllTabInfo(AllTabInfo) {
	for (var i=0; i<AllTabInfo.length; i++) {
		for (var j=0; j<AllTabInfo[i]['tabs'].length; j++) {
			openedTabArray[AllTabInfo[i]['tabs'][j].id] = {
                'url'   :   AllTabInfo[i]['tabs'][j].url,
                'index' :   AllTabInfo[i]['tabs'][j].index
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
