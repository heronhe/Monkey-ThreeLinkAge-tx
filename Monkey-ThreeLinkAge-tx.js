var MK_ThreeLinkAge = (function () {
    var ggLocation, oIframe;

    function createOptions(txt, val) {
        var op = document.createElement('option');
        op.innerHTML = txt;
        if(val)
            op.value = val;
        return op;
    }

    function $$(params) {
        var self = this;
        //后台返回的数据
        this.counterList = this.setCounterId(params.data)
        //省dom
        this.oProvice = params.provice;
        //市dom
        this.oCity = params.city
        //柜台dom
        this.oDistrict = params.district
        //是否启用定位
        this.locationStates = params.location;
        //设置默认值成功
        this.success = params.success;
        //更新最新柜台
        this.updateCity = params.updateCity;
        //更新省份
        this.updateProvice = params.updateProvice;

        this.updateDistrict = params.updateDistrict;

        this.defaultText = params.defaultText || ["省份", "城市", "专柜"];
        this.addDefaultText = params.addDefaultText;
        //init设置默认数据
        this.init();
        if (this.locationStates) {
            if (ggLocation) {
                //第一次以后不需要实例化获取定位
                self.getDistance(ggLocation);
            } else {
                //启用定位后，往页面中添加Iframe标签(腾讯地图:http://lbs.qq.com/tool/component-geolocation.html)
                if (!oIframe) {
                    oIframe = document.createElement("iframe");
                    oIframe.setAttribute("style", "display:none");
                    oIframe.setAttribute("src", "https://apis.map.qq.com/tools/geolocation?key=Q4EBZ-K2ORG-OSTQI-IKLRD-NTOXV-7DBVG&referer=pmlMap&effect=zoom");
                    document.body.appendChild(oIframe);
                }
                var txLocationMessage = function (event) {
                    var loc = event.data;
                    if (loc && loc.module == 'geolocation') {
                        var latlng = {lat: loc.lat, lng: loc.lng};
                        ggLocation = latlng;
                        //计算2个坐标的距离
                        self.getDistance(latlng);
                        window.removeEventListener('message', txLocationMessage);
                    }

                };
                //腾讯地图获取当前经纬度
                window.addEventListener('message', txLocationMessage, false);
            }
        }
        this.changeHandler(params.provice, params.city, params.district)
    };
    $$.prototype = {
        init: function () {
            var self = this;
            if(self.addDefaultText) {
                self.oProvice.appendChild(createOptions(self.defaultText[0]));
                self.oCity.appendChild(createOptions(self.defaultText[1]));
                self.oDistrict.appendChild(createOptions(self.defaultText[2]));
            }

            for (var i = 0; i < self.counterList[1].length; i++) {
                self.oProvice.appendChild(createOptions(self.counterList[1][i]));
            }
        },
        changeHandler: function (oProvice, oCity, oDistrict) {
            var self = this;
            //省市联动下拉框
            oProvice.addEventListener("change", function () {
                var province = oProvice.value;
                oCity.length = 1;
                if (self.oDistrict) {
                    oDistrict.length = 1;
                }
                if (province == self.defaultText[0]) {
                    return;
                }
                for (var j = 0; j < self.counterList[2][province].length; j++) {
                    oCity.appendChild(createOptions(self.counterList[2][province][j]));
                }

                if (typeof self.updateProvice === 'function')
                    self.updateProvice({"msg": "更新成功"});
            }, false);

            oCity.addEventListener("change", function () {
                var city = oCity.value;
                if (self.oDistrict) {
                    oDistrict.length = 1;
                }
                if (city == self.defaultText[1]) {
                    if (typeof self.updateCity === 'function') {
                        self.updateCity([]);
                    }
                    return;
                }

                if (self.oDistrict) {
                    for (var k = 0; k < self.counterList[3][city].length; k++) {
                        oDistrict.appendChild(createOptions(self.counterList[3][city][k].counterName, self.counterList[3][city][k].id));
                    }
                }
                //返回当前市的所有柜台
                if (typeof self.updateCity === 'function') {
                    self.updateCity(self.counterList[3][city])
                }
            }, false);

            oDistrict.addEventListener("change", function () {
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
                ctrLength = self.counterList[0].length;
            if (ctrLength < 1)
                return;
            //向原始数据添加计算后的距离dist
            for (var i = 0; i < ctrLength; i++) {
                var location = self.counterList[0][i].lc.split(',')
                //后台返回的数据中b坐标
                var b = new qq.maps.LatLng(location[1], location[0]);
                //腾讯地图api获取2点间距离,传入a,b
                self.counterList[0][i].dist = parseInt(qq.maps.geometry.spherical.computeDistanceBetween(a, b));
            }
            self.getDefaultVal();

        },
        //定位成功获取默认值
        getDefaultVal: function () {
            var self = this;
            //当前数据排序
            var sortObJInfo = self.sortObJ(self.counterList[0], 'dist');
            var firstCT = sortObJInfo[0];
            //默认选中最近的省
            var oOption, oOptionC, oOptionD;
            for (var i = 0; i < self.oProvice.options.length; i++) {
                if (self.locationStates) {
                    if (self.oProvice.options[i].value === firstCT.p) {
                        self.oProvice.options[i].selected = true;
                    }
                }
            }
            var _cn;
            //默认选中当前最近的市区
            for (var j = 0; j < self.counterList[2][firstCT.p].length; j++) {
                oOptionC = document.createElement('option');
                _cn = self.counterList[2][firstCT.p][j]
                oOptionC.innerHTML = _cn;
                this.oCity.appendChild(oOptionC);
                if (self.locationStates) {
                    if (_cn == firstCT.c) {
                        oOptionC.selected = true;
                    }
                }

            }
            var _cc;
            //默认选中当前最近的柜台
            if (self.oDistrict) {
                for (var k = 0; k < self.counterList[3][firstCT.c].length; k++) {
                    oOptionD = document.createElement('option');
                    _cc = self.counterList[3][firstCT.c][k];
                    oOptionD.innerHTML = _cc.counterName;
                    this.oDistrict.appendChild(oOptionD);
                    if (self.locationStates) {
                        if (_cc.counterName == firstCT.cn) {
                            oOptionD.selected = true;
                        }
                    }

                }
            }
            //返回当前市区的所有柜台
            if (typeof self.updateCounter === 'function') {
                self.updateCounter(self.counterList[3][firstCT.c], true)
            }

            self.success({data: true})
        },
        sortObJ: function (_ary, property) {
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
            var CounterIdList = [], PallList = [], ProvinceList = {}, CityList = {},
                cityList, counterList, _p, _c;

            for (var i = 0, lgt = data.length; i < lgt; i++) {
                _p = data[i].name;
                PallList.push(_p)
                ProvinceList[_p] = []
                cityList = data[i].list;
                for (var j = 0, lgt1 = cityList.length; j < lgt1; j++) {
                    _c = cityList[j].name;
                    CityList[_c] = [];
                    ProvinceList[_p].push(_c);
                    counterList = cityList[j].list;
                    for (var n = 0, lgt2 = counterList.length; n < lgt2; n++) {
                        CounterIdList.push({
                            id: counterList[n].counterId,
                            p: _p,
                            c: _c,
                            cn: counterList[n].counterName,
                            lc: counterList[n].location
                        });
                        CityList[_c].push({
                            city: _c,
                            id: counterList[n].counterId,
                            counterName: counterList[n].counterName,
                            address: counterList[n].address
                        });
                    }
                }

            }

            return [CounterIdList, PallList, ProvinceList, CityList];
        }
    }

    $$.prototype.constructor = $$;

    return $$;
})()





