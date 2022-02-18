import { DomainError } from "./errors"

export class Result<T, TE extends DomainError>{
    /**
     *
     */
    constructor(public value?: T, public error?: TE) {
    }
  
    isFailure = !!this.error
    isSuccess = !this.error
  
    static Success<T, TE extends DomainError>(value: T) : Result<T, TE>{
      return new Result(value, undefined)
    }
    static Error<T, TE extends DomainError>(error: TE){
      return new Result(<T>undefined, error)
    }
    static bind<T,K, TE extends DomainError>(res: Result<T, TE>, f: (value: T) => Result<K, TE>) : Result<K, TE>{
      if(res.isFailure)
        return Result.Error<K, TE>(res.error);
      return f(res.value)
    }
    static bindAsync<T,K, TE extends DomainError>(res: Result<T, TE>, f: (value: T) => Promise<Result<K, TE>>) : Promise<Result<K, TE>>{
      if(res.isFailure)
        return Promise.resolve(Result.Error<K, TE>(res.error));
      return f(res.value)
    }
    static async checkAsync<T,K, TE extends DomainError>(res: Result<T, TE>, f: (value: T) => Promise<Result<K, TE>>) : Promise<Result<T, TE>>{
      if(res.isFailure)
        return res;
      const secondResult = await f(res.value);
      if(secondResult.isSuccess)
        return res;
      return Result.Error<T, TE>(secondResult.error);
    }
    static async concat<T, K, TE extends DomainError>(res: Result<T, TE>, f: (value: T) => Promise<Result<K, TE>>) : Promise<Result<[T, K], TE>>{
      if(res.isFailure)
        return Result.Error<[T, K], TE>(res.error);
      
      const nextResult = await f(res.value);
      return nextResult.map(nextValue => [res.value, nextValue] as [T, K]);
    }
    static tryBind<T,K, TE extends DomainError>(
      res: Result<T, TE>, 
      f: (value: T) => Promise<K>,
      error: TE) : Promise<Result<K, TE>>{
      if(res.isFailure)
        return Promise.resolve(Result.Error<K, TE>(res.error));
      return Result.tryAsync(() => f(res.value), error)
    }
    static try<T, TE extends DomainError>(f: () => T, error: TE){
      try{
        const result = f()
        return Result.Success<T, TE>(result);
      }catch(err){
        return Result.Error<T, TE>(error)
      }
    }
    static async tryAsync<T, TE extends DomainError>(f: () => Promise<T>, error: TE){
      try{
        const result = await f()
        return Result.Success<T, TE>(result);
      }catch(err){
        return Result.Error<T, TE>(error)
      }
    }
    static map<T, K, TE extends DomainError>(result: Result<T, TE>, f: (v: T) => K){
      return result.map(value => f(value));
    }

    tap(f: (value: T) => void){
      if(this.isSuccess)
        f(this.value)
      return this;
    }
    async tapAsync<K>(f: (value: T) => Promise<K>) : Promise<Result<T, TE>>{
      if(this.isSuccess)
        await f(this.value)
      return this;
    }
    map<K>(mapper: (value:T) => K) : Result<K, TE>{
      if(this.isSuccess)
        return Result.Success(mapper(this.value))
      return Result.Error(this.error);
    }
    onFailure(err: (error: TE) => void){
      if(this.isFailure)
        err(this.error)
      return this;
    }
    pipe<K>(mapper: (value:T) => Result<K,TE>) : Result<K, TE>{
      if(this.isSuccess)
        return mapper(this.value)
      return Result.Error(this.error);
    }

    pipeAsync<K>(mapper: (value:T) => Promise<Result<K,DomainError>>) : Promise<Result<K,DomainError>>{
      if(this.isSuccess)
        return mapper(this.value)
      return Promise.resolve(Result.Error<K, DomainError>(this.error))
    }
  }


