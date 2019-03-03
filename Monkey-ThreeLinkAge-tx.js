var MK_ThreeLinkAge = (function () {
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
        //省dom
        this.proviceElem = params.provice || null;
        //市dom
        this.cityElem = params.city;
        //柜台dom
        this.districtElem = params.district;
        //是否启用定位
        this.location = params.location;
        this.key = params.key || 'Q4EBZ-K2ORG-OSTQI-IKLRD-NTOXV-7DBVG';
        //设置默认值成功
        this.success = params.success;
        //更新最新柜台
        this.updateCity = params.updateCity;
        //更新省份
        this.updateProvice = params.updateProvice;
        this.updateDistrict = params.updateDistrict;
        this.defaultText = params.defaultText || ["城市", "专柜"];
        this.addDefaultText = params.addDefaultText;
        //后台返回的数据
        this.counterParam = this.setCounterId(params.data);
        var self = this;
        //init设置默认数据
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

                var txLocationMessage = function (event) {
                    var loc = event.data;
                    if (loc && loc.module == 'geolocation') {
                        var latlng = {lat: loc.lat, lng: loc.lng};
                        ggLocation = latlng;

                        //获取当前城市的坐标距离
                        if(!self.proviceElem){
                            var newLocCounterList = [],
                                locCity = loc.city,
                                AllCounterList = self.counterParam.AllCounterList;
                            for(var n = 0, lgt = AllCounterList.length; n < lgt; n++){
                                if(AllCounterList[n].c == locCity){
                                    newLocCounterList.push(AllCounterList[n]);
                                }
                            }
                            if(newLocCounterList.length > 0)
                                self.counterParam.AllCounterList = newLocCounterList;
                        }
                        //计算2个坐标的距离
                        self.getDistance(latlng);
                        window.removeEventListener('message', txLocationMessage);
                    }

                };
                //腾讯地图获取当前经纬度
                window.addEventListener('message', txLocationMessage, false);
            }
        }
        this.changeHandler();
    };
    $$.prototype = {
        init: function () {
            if(!this.proviceElem)
                this.defaultText.splice(0, 0, '');
            if(this.addDefaultText) {
                if(this.proviceElem){
                    this.proviceElem.appendChild(createOptions(this.defaultText[0]));
                }

                this.cityElem.appendChild(createOptions(this.defaultText[1]));

                if(this.districtElem)
                    this.districtElem.appendChild(createOptions(this.defaultText[2]));
            }

            if(this.proviceElem) {
                for (var i = 0, lgt = this.counterParam.PallList.length; i < lgt; i++) {
                    this.proviceElem.appendChild(createOptions(this.counterParam.PallList[i]));
                }
            } else{
                var cityList = this.counterParam.ProvinceList.all;
                for (var i = 0, lgt = cityList.length; i < lgt; i++) {
                    this.cityElem.appendChild(createOptions(cityList[i]));
                }
            }

        },
        changeHandler: function () {
            var self = this;
            //省市联动下拉框
            if(this.proviceElem)
                this.proviceElem.addEventListener("change", function () {
                    var province = self.proviceElem.value;
                        self.cityElem.length = 1;
                    if (self.districtElem)
                        self.districtElem.length = 1;

                    if (province == self.defaultText[0]) {
                        if (typeof self.updateProvice === 'function')
                            self.updateProvice([]);
                        return;
                    }
                    for (var j = 0; j < self.counterParam.ProvinceList[province].length; j++) {
                        self.cityElem.appendChild(createOptions(self.counterParam.ProvinceList[province][j]));
                    }

                    if (typeof self.updateProvice === 'function')
                        self.updateProvice(self.counterParam.ProvinceList[province]);

                }, false);

            if(this.cityElem)
                this.cityElem.addEventListener("change", function () {
                    var city = self.cityElem.value;
                    if (self.districtElem) {
                        self.districtElem.length = 1;
                    }
                    if (city == self.defaultText[1]) {
                        if (typeof self.updateCity === 'function') {
                            self.updateCity([]);
                        }
                        return;
                    }

                    if (self.districtElem) {
                        for (var k = 0; k < self.counterParam.CityList[city].length; k++) {
                            self.districtElem.appendChild(createOptions(self.counterParam.CityList[city][k].counterName, self.counterParam.CityList[city][k].id));
                        }
                    }
                    //返回当前市的所有柜台
                    if (typeof self.updateCity === 'function') {
                        self.updateCity(self.counterParam.CityList[city])
                    }
                }, false);

            if(this.districtElem)
                this.districtElem.addEventListener("change", function () {
                    //返回当前市的所有柜台
                    if (typeof self.updateDistrict === 'function') {
                        self.updateDistrict()
                    }
                }, false);
        },
        getDistance: function (ggPoint) {
            var self = this;
            //当前位置A坐标
            var a = new qq.maps.LatLng(ggPoint.lat, ggPoint.lng),
                ctrLength = this.counterParam.AllCounterList.length;
            if (ctrLength < 1)
                return;
            //向原始数据添加计算后的距离dist
            for (var i = 0; i < ctrLength; i++) {
                var location = self.counterParam.AllCounterList[i].location.split(',')
                //后台返回的数据中b坐标
                var b = new qq.maps.LatLng(location[1], location[0]);
                //腾讯地图api获取2点间距离,传入a,b
                var distance = parseInt(qq.maps.geometry.spherical.computeDistanceBetween(a, b));
                self.counterParam.AllCounterList[i].distance = distance;
                self.counterIdList[self.counterParam.AllCounterList[i].id].distance = distance;
            }
            this.setDefaultChange();
        },
        //定位成功设置最近柜台
        setDefaultChange: function () {
            var self = this;
            //所有门店排序
            var sortObJInfo = this.sortStore(this.counterParam.AllCounterList, 'distance');
            var firstStore = sortObJInfo[0];
            
            //当前城市门店排序
            for(var _p in this.counterParam.CityList){
                this.counterParam.AllCounterList[_p] = this.sortStore(this.counterParam.CityList[_p], 'distance');
            }
            //默认选中最近的省
            var oOptionC, oOptionD;

            if(this.proviceElem) {
                for (var i = 0; i < this.proviceElem.options.length; i++) {
                    if (this.location) {
                        if (this.proviceElem.options[i].value === firstStore.provice) {
                            this.proviceElem.options[i].selected = true;
                        }
                    }
                }

                if (typeof this.updateProvice === 'function')
                    this.updateProvice(this.counterParam.ProvinceList[firstStore.provice]);
                
            } else {
                firstStore.provice = 'all';
            }
            var _cn;

            this.cityElem.length = 1;

            for (var j = 0; j < this.counterParam.ProvinceList[firstStore.provice].length; j++) {
                oOptionC = document.createElement('option');
                _cn = this.counterParam.ProvinceList[firstStore.provice][j]
                oOptionC.innerHTML = _cn;
                this.cityElem.appendChild(oOptionC);
                if (this.location) {
                    if (_cn == firstStore.city) {
                        oOptionC.selected = true;
                    }
                }
            }

            if (typeof self.updateCity === 'function')
                self.updateCity(self.counterParam.CityList[firstStore.city]);

            var _cc;
            //默认选中当前最近的柜台
            if (this.districtElem) {
                this.districtElem.length = 1;
                for (var k = 0; k < self.counterParam.CityList[firstStore.city].length; k++) {
                    oOptionD = document.createElement('option');
                    _cc = self.counterParam.CityList[firstStore.city][k];
                    oOptionD.innerHTML = _cc.counterName;
                    this.districtElem.appendChild(oOptionD);
                    if (self.location) {
                        if (_cc.counterName == firstStore.counterName) {
                            oOptionD.selected = true;
                        }
                    }

                }

                if (typeof this.updateDistrict === 'function')
                    this.updateDistrict();
            }

            if (typeof this.success === 'function') {
                this.success({data: true});
            }

        },
        //门店排序
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
        setCounterId: function (data) {
            var self = this,
                AllCounterList = [], //全国门店列表
                PallList = [],
                ProvinceList = {},
                CityList = {},
                cityList, counterParam, _p, _c;

            self.counterIdList = {};

            for (var i = 0, lgt = self.proviceElem ? data.length : 1; i < lgt; i++) {
                if(self.proviceElem) {
                    _p = data[i].name;
                    PallList.push(_p);
                    ProvinceList[_p] = [];
                    cityList = data[i].list;
                } else {
                    cityList = data;
                    ProvinceList.all = [];
                }
                for (var j = 0, lgt1 = cityList.length; j < lgt1; j++) {
                    _c = cityList[j].name;
                    CityList[_c] = [];
                    if(self.proviceElem) {
                        ProvinceList[_p].push(_c);
                    } else {
                        ProvinceList.all.push(_c);
                    }
                    counterParam = cityList[j].list;
                    var  counterId, counterInfo;
                    for (var n = 0, lgt2 = counterParam.length; n < lgt2; n++) {
                        counterId = counterParam[n].counterId;
                        counterInfo = {
                            id: counterId,
                            city: _c,
                            counterName: counterParam[n].counterName,
                            location: counterParam[n].location,
                            address: counterParam[n].address || ''
                        };
                        if(_p)
                            counterInfo.provice = _p;
                        AllCounterList.push(counterInfo);
                        self.counterIdList[counterId] = counterInfo;
                        CityList[_c].push(counterInfo);
                    }
                }

            }

            return {
                AllCounterList: AllCounterList,
                PallList: PallList,
                ProvinceList: ProvinceList,
                CityList: CityList
            };
        }
    };

    $$.prototype.constructor = $$;

    return $$;
})();





