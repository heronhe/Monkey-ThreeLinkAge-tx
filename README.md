# Monkey-ThreeLinkAge-tx
三级联动，可通过腾讯定位进行柜台排序

使用案例：

   new ThreeLinkAge({
        data: result.data,
        provice: document.getElementById('province'), //省份dom对象
        city: document.getElementById('city'), //城市dom对象
        district: document.getElementById('counter'), //柜台dom对象
        location:false, //是否开启定位
        defaultText:["省份", "城市", "专柜"], //默认select未选择时显示内容
        addDefaultText: false,
        updateProvice: function () { //选择省份时执行事件
            //console.log(1)
        },
        updateCity: function () {
            //console.log(2)
        },
        updateDistrict: function () {
            //console.log(3)
        }
    });


result.data 通过接口获取到的柜台信息，数据格式如下：



{
  "isSuccess": true,
  "code": 0,
  "data": [
    {
      "name": "上海市",
      "list": [
        {
          "name": "上海市",
          "list": [
            {
              "counterName": "上海大悦城-专卖店M",
              "counterId": "TM009503",
              "location": "121.47820335568113,31.24880173991037"
            },
            {
              "counterName": "上海晶品-专卖店M",
              "counterId": "TM001457",
              "location": "121.45327510828757,31.23185193909648"
            },
            {
              "counterName": "上海来福士-专卖店M",
              "counterId": "TM081124",
              "location": "121.48329150361512,31.238958826715166"
            }
              "counterId": "TM081853",
              "location": "121.41928277863727,31.23960883480818"
