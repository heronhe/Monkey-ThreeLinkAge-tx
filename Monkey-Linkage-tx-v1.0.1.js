var MK_Linkage = (function () {
    var ggLocation, TXiframe;

    //创建option dom
    function createOptions(txt, val) {
        var opt = document.createElement('option');
        opt.innerHTML = txt;
        if(val)
            opt.value = val;
        return opt;
    }

    function $$(params) {
        //dom
        this.domList = params.domList || [];
        //是否启用定位
        this.location = params.location;
        this.key = params.key || 'Q4EBZ-K2ORG-OSTQI-IKLRD-NTOXV-7DBVG';
        //设置默认值成功
        this.success = params.success;
        //后台返回的数据

        this.data = params.data;
        //坐标顺序
        this.coordinateDataOrder = params.coordinateDataOrder;
        this.timeout = params.timeout || 5000;
        var _this = this;

        //init初始化
        this.init();

        if (this.location) {
            if (ggLocation) {
                //第一次以后不需要实例化获取定位
                this.getDistance(ggLocation);
            } else {
                //启用定位后，往页面中添加Iframe标签(腾讯地图:http://lbs.qq.com/tool/component-geolocation.html)
                if (!TXiframe) {
                    TXiframe = document.createElement("iframe");
                    TXiframe.setAttribute("style", "display:none");
                    TXiframe.setAttribute("src", "https://apis.map.qq.com/tools/geolocation?key=" + this.key + "&referer=pmlMap&effect=zoom");
                    document.body.appendChild(TXiframe);
                }

                var msgNum = 0;

                var locationTimeout = setTimeout(function (){
                    if(typeof params.locationError === 'function'){
                        params.locationError();
                    }
                }, this.timeout);

                function txLocationMessage (event) {
                    ++msgNum;
                    var loc = event.data;
                    if(!loc && msgNum == 1){
                        return;
                    }

                    window.removeEventListener('message', txLocationMessage);

                    if(locationTimeout)
                        clearTimeout(locationTimeout);

                    if(!event.data){
                        //定位失败
                        if(typeof params.locationError === 'function'){
                            params.locationError();
                        }
                    }

                    if (loc && loc.module == 'geolocation') {
                        var latlng = {lat: loc.lat, lng: loc.lng};
                        ggLocation = latlng;

                        //计算2个坐标的距离
                        _this.getDistance(latlng);

                        if(typeof params.locationSuccess === 'function'){
                            params.locationSuccess();
                        }
                    }

                }
                //腾讯地图获取当前经纬度
                window.addEventListener('message', txLocationMessage, false);
            }
        }
        this.addChangeHandler();
    }
    $$.prototype = {
        //初始化
        init: function () {
            for(let val of this.domList){
                if(!val.element)
                    continue;

                val.element.length = 0;
                val.element.appendChild(createOptions(val.text || '请选择'));
            }

            this.temporaryData = {};

            this.addOptions(this.domList[0].element, this.data);

            this.temporaryData[0] = this.data;

            this.parseData();

        },
        //添加选择联动事件
        addChangeHandler: function () {
            var _this = this;
            for(var i = 0, lgt = this.domList.length; i < lgt; i++){
                var domItem = this.domList[i];
                if(!domItem.element)
                    continue;

                (function(i){
                    domItem.element.addEventListener("change", function () {
                        var selectVal = this.value;
                        var level = i + 1;

                        for(m = level; m < lgt; m++){
                            if(_this.domList[m].element && _this.domList[m].element.length > 1){
                                _this.domList[m].element.length = 1;
                            }
                        }

                        if(level < lgt){
                            _this.temporaryData[level] = _this.getList(selectVal, _this.temporaryData[i]);

                            if(_this.domList[level].element)
                                _this.addOptions(_this.domList[level].element, _this.temporaryData[level]);
                        }

                        if(typeof _this.domList[i].update == 'function')
                            _this.domList[i].update(selectVal, _this.temporaryData[level] || null);

                    }, false);
                })(i);

            }
        },
        getList: function(name, list){
            for(let val of list){
                if(val.name == name){
                    return val.list
                }
            }
        },
        //select添加内容
        addOptions: function(element, list){
            if(!list)
                return;

            for (let val of list) {
                element.appendChild(createOptions(val.name || val.counterName, val.counterId || null));
            }
        },
        getDistance: function (ggPoint) {
            var _this = this;
            //当前位置A坐标
            var a = new qq.maps.LatLng(ggPoint.lat, ggPoint.lng),
                counterIdList = Object.keys(_this.counterParam),
                ctrLength = counterIdList.length;

            if (ctrLength == 0)
                return;

            _this.sortCounterList = [];

            //向原始数据添加计算后的距离dist
            for (let p in _this.counterParam) {
                var val = _this.counterParam[p];
                var location = val.location.split(',');
                //后台返回的数据中b坐标
                var b;
                if(this.coordinateDataOrder == 1)
                    b = new qq.maps.LatLng(location[1], location[0]);
                else
                    b = new qq.maps.LatLng(location[0], location[1]);
                //腾讯地图api获取2点间距离,传入a,b
                var distance = parseInt(qq.maps.geometry.spherical.computeDistanceBetween(a, b));
                val.distance = distance;

                _this.sortCounterList.push(val);
            }

            this.setLocationCounter();
        },
        //定位成功设置最近柜台
        setLocationCounter: function () {
            var _this = this;

            //所有门店排序
            _this.sortCounterList = this.sortStore(_this.sortCounterList, 'distance');
            var firstStore = _this.sortCounterList[0];

            this.setDefaultCounter(firstStore.counterId);

        },
        setDefaultCounter: function (counterId) {
            var _this = this;
            //未完成定位不可以设置
            if(_this.location && !ggLocation)
                return;

            if(!this.counterParam)
                return;

            var curItem = this.counterParam[counterId];

            if(!curItem)
                return;

            for(var p in curItem.parents){
                p = parseInt(p);

                _this.temporaryData[p + 1] = _this.getList(curItem.parents[p], _this.temporaryData[p]);

                if(p != 0){
                    _this.addOptions(_this.domList[p].element, _this.temporaryData[p]);
                }

                var options = this.domList[p].element.options;
                this.setOptions(options, curItem.parents[p]);
            }

            _this.addOptions(_this.domList[curItem.level].element, _this.temporaryData[curItem.level]);

            this.setOptions(_this.domList[curItem.level].element.options, curItem.counterId);

        },
        setOptions(options, name){
            for(let val of options){
                if(val.value == name){
                    val.selected = true;
                    return;
                }
            }
        },
        //数据处理
        parseData(){
            let _this = this;

            this.counterParam = {};
            let getChildList = function (list, parents, level) {

                for(let val of list){
                    if(val.list){
                        if(parents)
                            createParents = parents;
                        else
                            createParents = {};

                        createParents[level] = val.name;
                        getChildList(val.list, createParents, level + 1);
                    } else {

                        val.parents = parents;
                        val.level = level;
                        _this.counterParam[val.counterId] = val;

                    }

                }
            };

            getChildList(this.data, null, 0);

        },
        //门店距离排序
        sortStore: function (_ary, property) {
            var _val;
            for (var i = 0, lgt = _ary.length - 1; i < lgt; i++) {
                for (var j = 0; j < lgt - i; j++) {
                    if (_ary[j][property] > _ary[j + 1][property]) {
                        _val = _ary[j + 1];
                        _ary[j + 1] = _ary[j];
                        _ary[j] = _val;
                    }
                }
            }

            return _ary;
        },
        //更新数据
        updataCounterData: function(data){
            this.data = this.data;
            this.init();
            if (this.location && ggLocation) {
                this.getDistance(ggLocation);
            }
        }
    };

    $$.prototype.constructor = $$;

    return $$;
})();