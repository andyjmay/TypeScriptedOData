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
        filter(query: FilterQuery): IODataQuery;
        compile(): string;
    }

    export class FilterQuery {
        private subFilterQueries: ISubFilterQuery[];

        constructor(private options: IFilterQueryOptions) {
            this.subFilterQueries = [];
        }

        public and(filterQuery: FilterQuery): FilterQuery {
            this.subFilterQueries.push({
                Operator: SubFilterQueryOperator.And,
                Query: filterQuery
            });
            return this;
        }

        public or(filterQuery: FilterQuery): FilterQuery{
            this.subFilterQueries.push({
                Operator: SubFilterQueryOperator.Or,
                Query: filterQuery
            });
            return this;
        }

        public compile(): string {
            var filterString = this.getFilterQueryString(this.options);
            this.subFilterQueries.forEach((subFilterQuery) => {
                var subFilterQueryString: string;
                switch (subFilterQuery.Operator){
                    case SubFilterQueryOperator.And: 
                        subFilterQueryString = " and " + subFilterQuery.Query.compile();
                        break;
                    case SubFilterQueryOperator.Or:
                        subFilterQueryString = " or " + subFilterQuery.Query.compile();
                        break;
                    default:
                        break;
                }
                filterString += subFilterQueryString;
            });
            return filterString;
        }
        
        private getFilterQueryString(filterQueryOptions: IFilterQueryOptions) {
            var filterQueryString = filterQueryOptions.property + " " + this.getComparisonOperator(filterQueryOptions.operator);
            var propertyValueType = typeof(filterQueryOptions.propertyValue);
            switch (propertyValueType) { 
                case "string":
                    filterQueryString += " '" + filterQueryOptions.propertyValue + "'";
                    break;
                case "number":
                    filterQueryString += " " + filterQueryOptions.propertyValue;
                    break;
                default:
                    break;
            }
            return filterQueryString;
        }

        private getComparisonOperator(operator: ComparisonOperator) {
            switch (operator) {
                case ComparisonOperator.Equals:
                    return 'eq';
                case ComparisonOperator.NotEquals:
                    return 'ne';
                case ComparisonOperator.GreaterThan:
                    return 'gt';
                case ComparisonOperator.GreaterThanOrEqual:
                    return 'ge';
                case ComparisonOperator.LessThan:
                    return 'lt';
                case ComparisonOperator.LessThanOrEqual:
                    return 'le';
                default:
                    return '';
            }
        }
    }
    
    interface ISubFilterQuery {
        Operator: SubFilterQueryOperator,
        Query: FilterQuery
    }
    
    enum SubFilterQueryOperator {
        And,
        Or
    }
    
    export interface IFilterQueryOptions {
        property: string;
        operator: ComparisonOperator;
        propertyValue: string | number;
    }
    
    export enum ComparisonOperator {
        Equals,
        NotEquals,
        GreaterThan,
        GreaterThanOrEqual,
        LessThan,
        LessThanOrEqual,
    }

    export class ODataQuery implements IODataQuery {
        private queryOptions: IQueryOptions;

        constructor() {
            this.queryOptions = <IQueryOptions>{};
        }

        select(properties: string[]): ODataQuery {
            this.queryOptions.$select = "$select=" + properties.join(",");
            return this;
        }

        expand(properties: string[], subQueries?: IODataQuery[]): ODataQuery {
            if (subQueries) {
                if (properties.length != subQueries.length) {
                    throw "There must be one subquery per entity, use null if no subquery is required";
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
            } else {
                this.queryOptions.$expand = "$expand=" + properties.join(",");
            }
            return this;
        }

        take(amount: number): ODataQuery {
            this.queryOptions.$top = "$top=" + amount;
            return this;
        }
        
        count(includeCount?: boolean): ODataQuery {
            if (includeCount === false) {
                this.queryOptions.$count = "$count=false";
            } else {
                this.queryOptions.$count = "$count=true";
            }
            return this;
        }

        filter(query: FilterQuery): ODataQuery {
            this.queryOptions.$filter = "$filter=" + query.compile();
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
            if (this.queryOptions.$filter) {
                if (queryString) {
                    queryString += "&";
                }
                queryString += this.queryOptions.$filter;
            }
            if (this.queryOptions.$count){
                queryString += this.queryOptions.$count;
            }
            return queryString;
        }
    }
}