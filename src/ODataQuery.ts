module TypeScriptedOData {
    interface IQueryOptions {
        $filter: string;
        $expand: string;
        $orderby: string;
        $top: string;
        $skip: string;
        $count: string;
        $search: string;
        $format: string;
        $select: string;
    }
    
    export interface IODataQuery {
        select<TResult>(entity: TResult, properties: TResult[]): ODataQuery;
        expand<TEntity, TRelatedEntity>(entity: TEntity, relatedEntity: TRelatedEntity): ODataQuery;
        take(amount: number): ODataQuery;
        compile(): string;
    }

    export class ODataQuery implements IODataQuery {
        private queryOptions: IQueryOptions;

        constructor() {
            this.queryOptions = <IQueryOptions>{};
        }

        select<TResult>(entity: TResult, properties: TResult[]): ODataQuery {
            var entityProperties = properties.map(t => {
                return entity[<any>t];
            });
            this.queryOptions.$select = "$select=" + entityProperties.join(",");
            return this;
        }

        expand<TEntity>(entity: TEntity, properties: TEntity[], subQueries?: ODataQuery[]): ODataQuery {
            var entityProperties = properties.map(t => {
                return entity[<any>t];
            });

            if (subQueries) {
                if (properties.length != subQueries.length) {
                    throw "There must be one subquery per entity, use null if no subquery is required"
                }
                this.queryOptions.$expand = "$expand=";
                entityProperties.forEach((property, index) => {
                    if (index > 0){
                        this.queryOptions.$expand += ",";
                    }
                    this.queryOptions.$expand += property;
                    if (subQueries[index]) {
                        this.queryOptions.$expand += "(" + subQueries[index].compile() + ")";
                    }
                });
            } else {
                this.queryOptions.$expand = "$expand=" + entityProperties.join(",");
            }
            return this;
        }

        take(amount: number): ODataQuery {
            this.queryOptions.$top = "$top=" + amount;
            return this;
        }

        compile(): string {
            var queryString = "";
            if (this.queryOptions.$select) {
                if (queryString) {
                    queryString += "&";
                }
                queryString += this.queryOptions.$select;
            }
            if (this.queryOptions.$expand) {
                if (queryString) {
                    queryString += "&";
                }
                queryString += this.queryOptions.$expand;
            }
            if (this.queryOptions.$top) {
                if (queryString) {
                    queryString += "&";
                }
                queryString += this.queryOptions.$top;
            }
            return queryString;
        }
    }
}