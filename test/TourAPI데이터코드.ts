//   async getAllB() {
//     const all = await this.area.find({});
//     for (let i of all) {
//       const code = i.code;
//       const arrayCode = await this.getB(code);
//       for (let k in arrayCode) {
//         const j = arrayCode[k];

//         const areacodeA = i;
//         const insert = await this.detailArea.create({ ...j, areacode: i });
//         await this.detailArea.save(insert);
//       }
//     }
//   }

//   async getB(code: number) {
//     const encodeKey =
//       'R1YkIepzkxhj6Ouue%2Fo0BcyXRM89NzjOU2baG8hXDjqv7MyVSxspxUBLzUZOJPISnGgxDg8SaIutpCmhB7OE%2Fg%3D%3D';

//     const serviceKey = decodeURIComponent(encodeKey);
//     const data = await axios.get(
//       'http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode',
//       {
//         params: {
//           serviceKey,
//           numOfRows: 50,
//           pageNo: 1,
//           MobileOS: 'ETC',
//           MobileApp: 'gotrip',
//           areaCode: code,
//         },
//       },
//     );
//     const {
//       data: {
//         response: {
//           body: {
//             items: { item },
//           },
//         },
//       },
//     } = data;
//     return item;
//   }
