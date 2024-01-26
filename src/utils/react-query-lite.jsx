import {createContext, useContext, useEffect, useReducer, useRef} from "react";

const context = createContext()

export function QueryClientProvider({children, client}) {
    return <context.Provider value={client}>{children}</context.Provider>
}

// Class to store query list
export class QueryClient {
    constructor() {
        this.queries = []
    }

    getQuery = options => {
        const queryHash = JSON.stringify(options.queryKey)
        let query = this.queries.find(d => d.queryHash === queryHash)

        if (!query) {
            query = createQuery(this, options)
            this.queries.push(query)
        }

        return query
    }
}

export function useQuery({queryKey, queryFn}) {
    const client = useContext(context)
    const [, rerender] = useReducer(i => i + 1, 0)
    const observerRef = useRef()
    if (!observerRef.current) {
        observerRef.current = createQueryObserver(client, {
            queryKey, queryFn
        })
    }

    useEffect(() => {
        return observerRef.current.subscribe(rerender)
    }, []);

    return observerRef.current.getResult()
}

export function ReactQueryDevTools() {
    return null
}

// Query is just an object with some states, fetch function
function createQuery(client, {queryKey, queryFn}) {
    let query = {
        queryKey,
        queryHash: JSON.stringify(queryKey),
        promise: null,
        subscribers: [],
        state: {
            status: 'loading',
            isFetching: true,
            data: undefined,
            error: undefined
        },

        subscribe: (subscriber) => {
            query.subscribers.push(subscriber)
            return () => {
                query.subscribers = query.subscribers.filter(d => d !== subscriber)
            }
        },

        setState: (updater) => {
            query.state = updater(query.state)
            query.subscribers.forEach(subscriber => subscriber.notify())
        },

        fetch: () => {
            if (!query.promise) {
                query.promise = (async () => {
                    query.setState(old => ({
                        ...old,
                        isFetching: true,
                        error: undefined
                    }))
                    try {
                        const data = await queryFn()
                        query.setState(old => ({
                            ...old,
                            status: 'success',
                            data
                        }))
                    } catch (error) {
                        query.setState(old => ({
                            ...old,
                            status: 'error',
                            error
                        }))
                    } finally {
                        query.promise = null
                        query.setState(old => ({
                            ...old,
                            isFetching: false
                        }))
                    }

                })()
            }
            return query.promise
        }
    }
    return query
}

function createQueryObserver(client, {queryKey, queryFn}) {
    const query = client.getQuery({queryKey, queryFn})
    const observer = {
        notify: () => {
        },
        getResult: () => query.state,
        // subscribe called from useQuery and pass callback to re-render component when something changes
        subscribe: (callback) => {
            observer.notify = callback
            const unsubscribe = query.subscribe(observer)
            query.fetch()
            return unsubscribe
        }
    }
    return observer
}
