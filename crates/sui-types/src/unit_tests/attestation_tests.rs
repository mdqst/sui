// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use super::attestation_verify_inner;
use fastcrypto::encoding::Encoding;
use fastcrypto::encoding::{Base64, Hex};

#[test]
fn attestation_parse() {
    let res = attestation_verify_inner(
        &Hex::decode("8444a1013822a059111fa9696d6f64756c655f69647827692d30663733613462346362373463633966322d656e633031393265343138386665663738316466646967657374665348413338346974696d657374616d701b00000192e43cadbb6470637273b0005830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000015830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000025830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035830639a8b65f68b0223cbb14a0032487e5656d260434e3d1a10e7ec1407fb86143860717fc8afee90df7a1604111709af460458309ab5a1aba055ee41ee254b9b251a58259b29fa1096859762744e9ac73b5869b25e51223854d9f86adbb37fe69f3e5d1c0558300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000658300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000758300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000858300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000958300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006b636572746966696361746559027e3082027a30820201a00302010202100192e4188fef781d000000006723e692300a06082a8648ce3d04030330818e310b30090603550406130255533113301106035504080c0a57617368696e67746f6e3110300e06035504070c0753656174746c65310f300d060355040a0c06416d617a6f6e310c300a060355040b0c034157533139303706035504030c30692d30663733613462346362373463633966322e75732d656173742d312e6177732e6e6974726f2d656e636c61766573301e170d3234313033313230323033315a170d3234313033313233323033345a308193310b30090603550406130255533113301106035504080c0a57617368696e67746f6e3110300e06035504070c0753656174746c65310f300d060355040a0c06416d617a6f6e310c300a060355040b0c03415753313e303c06035504030c35692d30663733613462346362373463633966322d656e63303139326534313838666566373831642e75732d656173742d312e6177733076301006072a8648ce3d020106052b81040022036200049e2df2f8fe1ce8e1053b01397cb574a0558a46ef1526fd1b3784a16d01f2a07a802f5b7d99ba5fb293c5d43bd53579a1ca8791a9184f5e297ae7fd88a75bad074418a72153ce2a0a4673de6bfd8afac6fb650e36e121a37ef19453be770e6145a31d301b300c0603551d130101ff04023000300b0603551d0f0404030206c0300a06082a8648ce3d04030303670030640230097d15740cb4ae0d03c6ec77c0b153ac9257a292cf3316bfd7ba15bf41a91d09e661a476d9286d8cf4b64466a4cb9d1b02301179c3a2f9303bfa617b1e4c9a6fcdfe14cd126730d1d885834006b6e5c87454c3650d361b01e882a22fbf0cb1e2514168636162756e646c65845902153082021130820196a003020102021100f93175681b90afe11d46ccb4e4e7f856300a06082a8648ce3d0403033049310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c03415753311b301906035504030c126177732e6e6974726f2d656e636c61766573301e170d3139313032383133323830355a170d3439313032383134323830355a3049310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c03415753311b301906035504030c126177732e6e6974726f2d656e636c617665733076301006072a8648ce3d020106052b8104002203620004fc0254eba608c1f36870e29ada90be46383292736e894bfff672d989444b5051e534a4b1f6dbe3c0bc581a32b7b176070ede12d69a3fea211b66e752cf7dd1dd095f6f1370f4170843d9dc100121e4cf63012809664487c9796284304dc53ff4a3423040300f0603551d130101ff040530030101ff301d0603551d0e041604149025b50dd90547e796c396fa729dcf99a9df4b96300e0603551d0f0101ff040403020186300a06082a8648ce3d0403030369003066023100a37f2f91a1c9bd5ee7b8627c1698d255038e1f0343f95b63a9628c3d39809545a11ebcbf2e3b55d8aeee71b4c3d6adf3023100a2f39b1605b27028a5dd4ba069b5016e65b4fbde8fe0061d6a53197f9cdaf5d943bc61fc2beb03cb6fee8d2302f3dff65902c1308202bd30820244a00302010202105e38d80df50697821a75868f41e784b0300a06082a8648ce3d0403033049310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c03415753311b301906035504030c126177732e6e6974726f2d656e636c61766573301e170d3234313032393039303734355a170d3234313131383130303734355a3064310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c034157533136303406035504030c2d616662353333343262366335383838352e75732d656173742d312e6177732e6e6974726f2d656e636c617665733076301006072a8648ce3d020106052b8104002203620004c92eff4f5268be6b0b2d5e402610285410046d5ff1ccbbada2cafac96ca22525a89d710bc69c6dddf1c5dde1bb29293416611718f47631c5c61945d82ad49c41a553af78f409763490a3f888edf8188fee6d6691aeba6faf3a559d1086f7437fa381d53081d230120603551d130101ff040830060101ff020102301f0603551d230418301680149025b50dd90547e796c396fa729dcf99a9df4b96301d0603551d0e041604144cb4eb898e87a14e9b196cc57923aa7899c45454300e0603551d0f0101ff040403020186306c0603551d1f046530633061a05fa05d865b687474703a2f2f6177732d6e6974726f2d656e636c617665732d63726c2e73332e616d617a6f6e6177732e636f6d2f63726c2f61623439363063632d376436332d343262642d396539662d3539333338636236376638342e63726c300a06082a8648ce3d0403030367003064023064ff9e5be5f0028e5cd81103213d49839330fcf2110d9e53bb4149fd71e86576ac27c53e886a92081bef34a006b2bead02300a6a31d99fe753f0b582f1ee81975e7c81bfb7a31bac3f41f0456107cb0c4442bfb644f8c672b322fd415b5445021210590319308203153082029ba003020102021100852d3a881d6902449e319ba2b5e9d1bb300a06082a8648ce3d0403033064310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c034157533136303406035504030c2d616662353333343262366335383838352e75732d656173742d312e6177732e6e6974726f2d656e636c61766573301e170d3234313033313037353034325a170d3234313130363033353034325a308189313c303a06035504030c33356138626266633236663932356238622e7a6f6e616c2e75732d656173742d312e6177732e6e6974726f2d656e636c61766573310c300a060355040b0c03415753310f300d060355040a0c06416d617a6f6e310b3009060355040613025553310b300906035504080c0257413110300e06035504070c0753656174746c653076301006072a8648ce3d020106052b810400220362000447bc86fbe2f49eaf541fef52b3bee0eb6e12ec1bdb27ffa399cfd236fb4c170dee6381b1039711a90bd88e0954ef6a88846cb46cd0e2fe7a0d8621ce52c8e66b00090e5823e2c3416a695f03290628147fca8766f8e021d7898d413bdf9a97f4a381ea3081e730120603551d130101ff040830060101ff020101301f0603551d230418301680144cb4eb898e87a14e9b196cc57923aa7899c45454301d0603551d0e041604142fb78d05684f062a6edd77765ac8b555ab745687300e0603551d0f0101ff0404030201863081800603551d1f047930773075a073a071866f687474703a2f2f63726c2d75732d656173742d312d6177732d6e6974726f2d656e636c617665732e73332e75732d656173742d312e616d617a6f6e6177732e636f6d2f63726c2f66316139303335362d616130622d343934332d613866612d3933613737623036396361332e63726c300a06082a8648ce3d0403030368003065023100984a7c2bf94a8045eacbedbe559d82be2c9872a7f842cdb9581176049f59edd0df470ed5197603a27a7983d719b295bf023062ade2ddf0a6f3f27e57e8a9b6ef8049f8811d5254ed6b9063d12d5e6911ab819d41d834ffa8ec6602ebc64edd25bfa95902c3308202bf30820245a003020102021500d5866ef7a8cc2588b9858bbf7d3362486149ad95300a06082a8648ce3d040303308189313c303a06035504030c33356138626266633236663932356238622e7a6f6e616c2e75732d656173742d312e6177732e6e6974726f2d656e636c61766573310c300a060355040b0c03415753310f300d060355040a0c06416d617a6f6e310b3009060355040613025553310b300906035504080c0257413110300e06035504070c0753656174746c65301e170d3234313033313130313030385a170d3234313130313130313030385a30818e310b30090603550406130255533113301106035504080c0a57617368696e67746f6e3110300e06035504070c0753656174746c65310f300d060355040a0c06416d617a6f6e310c300a060355040b0c034157533139303706035504030c30692d30663733613462346362373463633966322e75732d656173742d312e6177732e6e6974726f2d656e636c617665733076301006072a8648ce3d020106052b81040022036200040fe46adf864a558a00a9ca4b64ece5ba124ed1d29656a1f16ca71d0dc8fca56b0fb15aafd309f6258374e8c7b4a5b0521c76d1812a7873474dae9322aef1cd782db19fc2ece4d36fa08acbe65e4bec2a3cfe70960d179778ea7e7711f827b36ea366306430120603551d130101ff040830060101ff020100300e0603551d0f0101ff040403020204301d0603551d0e041604143e40d423bf86e9565c378487843389bd2f471a56301f0603551d230418301680142fb78d05684f062a6edd77765ac8b555ab745687300a06082a8648ce3d040303036800306502310097c76197278a1681013ff415526e54a66209e4c35c32227f7a84bd0d05c181f4db627c96b3284e4f2ce476b4834c04a2023050eb1c7e8c16c2b533f5e714a7389276b70b18c678c2f51189ca841d8908bc8e192626b97d5f577ad850b2896554ff646a7075626c69635f6b6579f669757365725f6461746158205a264748a62368075d34b9494634a3e096e0e48f6647f965b81d2a653de684f2656e6f6e6365f6586033dc0b143ec65334d7322ddab064080de20b7cc7c548c2441804e2456389e80e041963b5ac7e62c00e7fa49ae64afbc4ddad25a7951e82f8a64e5706049d70bfaf7f6ab39e321a38373d0e9e983d0438d0b6769fb3cd8ff25b35556bc2aae529").unwrap(),
        &Base64::decode("WiZHSKYjaAddNLlJRjSj4Jbg5I9mR/lluB0qZT3mhPI=").unwrap(),
        &Hex::decode("000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000").unwrap(),
        &Hex::decode("000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000").unwrap(),
        &Hex::decode("000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000").unwrap(),
    );
    println!("{:?}", res);
    assert!(res.is_ok());
}
