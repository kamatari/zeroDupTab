// zeroDupTabs.js
// Created by kamatari

// TODO
// ���꥿�֤ˤ��Ƥ���move�Ǥ��ʤ�
// move����tab��active�ˤ�����
// extension ��ͭ���ˤ���������duplicate�����ä�������error����

var MaxTabArrayNum	= 9999;
var stockTabsCount	= 0;
var openedTabArray	= new Array();
var closedTabArray	= new Array();

// extension��ͭ���ˤʤä������ǳ����Ƥ���tab�ξ�����stock
if (openedTabArray.length == 0) {
	chrome.windows.getAll({"populate" : true}, setAllTabInfo);
}

// ������tab�򳫤������ȹ������줿����url��stock
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
// �Ĥ���tab��url��opentab�����������ʤ����С�
chrome.tabs.onRemoved.addListener(
	function(closedTabId) {
		if (openedTabArray[closedTabId] != null) {
			closedTabArray.push(openedTabArray[closedTabId]);
			checkLengthAndArrayShift(closedTabArray);
		}
	}
);
*/

// extension�Υ���������click��,stock���Ƥ���url�ǿ���tab������
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
