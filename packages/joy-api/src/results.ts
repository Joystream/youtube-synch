
export class Result<T, TE>{
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
    static Error<TE>(error: TE){
      return new Result(undefined, error)
    }
  }
  
  export function map<T, K, TE>(result: Result<T, TE>, mapper: (value:T) => K) : Result<K, TE>{
    if(result.isSuccess)
      return Result.Success(mapper(result.value))
    return Result.Error(result.error);
  }