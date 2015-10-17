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
        select(properties: string[], subQueryies?: IODataQuery[]): IODataQuery;
        expand<TEntity, TRelatedEntity>(entity: TEntity, relatedEntity: TRelatedEntity): IODataQuery;
        take(amount: number): IODataQuery;
        compile(): string;
    }

    export class ODataQuery implements IODataQuery {
        private queryOptions: IQueryOptions;

        constructor() {
            this.queryOptions = <IQueryOptions>{};
        }
        
        private compileSubQueries(properties: string[], subQueries: IODataQuery[]) {
            if (properties.length != subQueries.length) {
                    throw "There must be one subquery per entity, use null if no subquery is required"
                }
                this.queryOptions.$expand = "$expand=";
                properties.forEach((property, index) => {
                    if (index > 0){
                        this.queryOptions.$expand += ",";
                    }
                    this.queryOptions.$expand += property;
                    if (subQueries[index]) {
                        this.queryOptions.$expand += "(" + subQueries[index].compile() + ")";
                    }
                });
        }

        select(properties: string[], subQueries?: IODataQuery[]): ODataQuery {
            if (subQueries) {
                this.compileSubQueries(properties, subQueries);
            } else {
                this.queryOptions.$select = "$select=" + properties.join(",");
            }
            return this;
        }

        expand(properties: string[], subQueries?: IODataQuery[]): ODataQuery {
            if (subQueries) {
                this.compileSubQueries(properties, subQueries);
            } else {
                this.queryOptions.$expand = "$expand=" + properties.join(",");
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