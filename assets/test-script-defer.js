// (function(){
//   const totalStart = performance.now();
//   console.log("defer script started");

//   const start = performance.now();
//   while (performance.now() - start < 100) {
//     let x = 0;
//     for (let i = 0; i < 1000; i++) {
//       x += Math.sqrt(i * Math.random());
//     }
//   }

//   const totalEnd = performance.now();

//   console.log("defer script finished");
//   console.log(`Execution time: ${(totalEnd - totalStart).toFixed(2)} ms`);
// })();
console.log("defer script finished");