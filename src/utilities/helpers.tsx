export const cancelablePromise = (promise: Promise<any>) => {
    let hasCanceled = false;

    const wrappedPromise = new Promise<any>((resolve, reject) => {
        promise.then(
            val => hasCanceled ? reject({ isCanceled: true }) : resolve(val),
            error => hasCanceled ? reject({ isCanceled: true }) : reject(error)
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled = true;
        },
    };
};
