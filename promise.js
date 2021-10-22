/**
 * 构造器有三个状态pending、fullFilled、rejected 只可从pending转换到后二者
 * value是我们期待得到的值 它可能是一个异步请求结果:axios.get({...}) 也可能是一个同步的原始值:Promise.resolve(1) 
 * 如果中间过程出现错误 未来会返回reason
 * 暴露一个then方法 它的回调总是被异步调用 它的返回值是一个新的promise
 * then 传参边缘条件处理
 * 错误处理
 */
 const PEDNGING = 'pending'
 const FULLFILLED = 'fullFilled'
 const REJECTED = 'rejected'
 
 function PPromise(cb) {
   this.status = PEDNGING
   this.value = undefined
   this.reason = undefined
   this.fullFilledCallBacks = []
   this.rejectedCallBacks = []
 
   const resolve = (value) => {
     if(this.status === PEDNGING) {
       this.status = FULLFILLED
       this.value = value
       this.fullFilledCallBacks.forEach(fn => fn())
     }
   }
   const reject = reason => {
     if(this.status === PEDNGING) {
       this.status = REJECTED
       this.reason = reason
       this.rejectedCallBacks.forEach(fn => fn())
     }
   }
   try {
     cb(resolve, reject)
   } catch (error) {
     reject(error)
   }
 }
 // new Promise((r) => {r(3123)}).then(1, 2)
 PPromise.prototype.then = function(onFullFilled, onRejected) {
   onFullFilled =
   typeof onFullFilled === 'function' ? onFullFilled : value => value
   onRejected =
     typeof onRejected === 'function'
       ? onRejected
       : reason => { throw(reason)}
     debugger
   const nextPromise = new PPromise((resolve, reject) => {
     let res
     // 异步计算 需将回调压栈
     if(this.status === PEDNGING) {
         this.fullFilledCallBacks.push(() => {
           setTimeout(() => {
             try {
               res = onFullFilled(this.value)
               resolvePromise(nextPromise, res, resolve, reject)
             } catch (error) {
               reject(error)
             }
 
           }, 0);
         })
         this.rejectedCallBacks.push(() => {
           setTimeout(() => {
             try {
               res = onRejected(this.reason)
               resolvePromise(nextPromise, res, resolve, reject)
             } catch (error) {
               reject(error)
             }
           }, 0);
         })
     }
 
     if(this.status === FULLFILLED) {
       setTimeout(() => {
         try {
           res =  onFullFilled(this.value) 
           resolvePromise(nextPromise, res, resolve, reject)
         } catch (error) {
           reject(error)
         }
       }, 0);
     }
     if(this.status === REJECTED) {
       setTimeout(() => {
         try {
           res = onRejected(this.reason) 
           resolvePromise(nextPromise, res, resolve, reject)
         } catch (error) {
           reject(error)
         }
       }, 0);
     }
   })
   return nextPromise
 }
 
 function resolvePromise(nextPromise, x, resolve, reject) {
   //If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason. via return from a fulfilled promise
   if(nextPromise === x) {
     reject(new TypeError('禁止无限套'));
   }
   if(x && typeof x === 'object' || typeof x === 'function') {
     let flag = false
       try {
         let then = x.then
         // 鸭子 如果有then 就判断它是一个promise
         if(typeof then === 'function') {
           then.call(x, res => {
             // resolve(res)
             if(flag) return
             flag = true
             resolvePromise(nextPromise, res, resolve, reject)
           }, err => {
             if(flag) return
             flag = true
             reject(err)
           })
         } else {
           if(flag) return
           flag = true
           resolve(x)
         }
         
       } catch (error) {
         if(flag) return
         flag = true
         reject(error)
       }
 
   }else {
     resolve(x)
   }
 
 }
 
 a = new PPromise((r) => {
   console.log(2);
   r(123)
   console.log(3);
     
 }).then(e => 
   {
     console.log(e*e)
     // debugger
   }).then(5)
 b = new Promise((r) => {r(123)}).then(5)
 
 
 PPromise.defer = PPromise.deferred = function () {
   let dfd = {};
   dfd.promise = new PPromise((resolve, reject) => {
       dfd.resolve = resolve;
       dfd.reject = reject;
   });
   return dfd;
 }
 module.exports =  PPromise