# Monkey-ThreeLinkAge-tx
支持三级联动和二级联动，可通过腾讯定位进行柜台排序。

页面需引入腾讯地图js库

    <script type="text/javascript" src="http://map.qq.com/api/js?v=2.exp&libraries=drawing,geometry,autocomplete,convertor"></script>


使用案例：

     new MK_ThreeLinkAge({
          key: "" //腾讯申请key
          data: result.data,
          provice: document.getElementById('province'), //省份dom对象，二级联动时，此参数为空
          city: document.getElementById('city'), //城市dom对象
          district: document.getElementById('counter'), //柜台dom对象
          location:false, //是否开启定位
          defaultText:["省份", "城市", "专柜"], //默认select未选择时显示内容
          addDefaultText: false,
          timeout: 5000, //定位超时时间
          coordinateDataOrder: 1, //柜台数据中经纬度顺序，例如"location": "121.48329150361512,31.238958826715166"
          updateProvice: function () { //选择省份时执行事件
              //省份选择
          },
          updateCity: function () {
              //城市选择
          },
          updateDistrict: function () {
              //区选择
          },
          locationError: function () {
              //定位失败
          },
      });

### 方法：

（1）setDefaultCounter
设置默认柜台，参数为counterId

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
