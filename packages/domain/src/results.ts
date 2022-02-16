import { DomainError } from "./errors"

export class Result<T, TE extends DomainError>{
    /**
     *
     */
    constructor(public value?: T, public error?: TE) {
    }
  
    isFailure = !!this.error
    isSuccess = !this.error
  
    static Success<T>(value: T){
      return new Result(value, undefined)
    }
    static Error<T, TE extends DomainError>(error: TE){
      return new Result(<T>undefined, error)
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