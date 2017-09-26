

//获取柜台信息
$.ajax({
    url: "./getCounter",
    type: "POST",
    dataType: "JSON",
    success: function (result) {
        if(result.isSuccess){
            new ThreeLinkAge({
                data: result.data,
                provice: document.getElementById('province'),
                city: document.getElementById('city'),
                district: document.getElementById('counter'),
                location:false,
                defaultText:["省份", "城市", "专柜"],
                addDefaultText: false,
                updateProvice: function () {
                    //console.log(1)
                },
                updateCity: function () {
                    //console.log(2)
                },
                updateDistrict: function () {
                    //console.log(3)
                }
            });
        }else{
            alert(result.errMsg);
        }
    },
    error: function(){
        alert('网络延迟,请稍后重试!');
    }
});



