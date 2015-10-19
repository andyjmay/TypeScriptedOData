var TypeScriptedOData;
(function (TypeScriptedOData) {
    var FilterQuery = (function () {
        function FilterQuery(options) {
            this.options = options;
            this.subFilterQueries = [];
        }
        FilterQuery.prototype.and = function (filterQuery) {
            this.subFilterQueries.push({
                Operator: SubFilterQueryOperator.And,
                Query: filterQuery
            });
            return this;
        };
        FilterQuery.prototype.or = function (filterQuery) {
            this.subFilterQueries.push({
                Operator: SubFilterQueryOperator.Or,
                Query: filterQuery
            });
            return this;
        };
        FilterQuery.prototype.compile = function () {
            var filterString = this.getFilterQueryString(this.options);
            this.subFilterQueries.forEach(function (subFilterQuery) {
                var subFilterQueryString;
                switch (subFilterQuery.Operator) {
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
        };
        FilterQuery.prototype.getFilterQueryString = function (filterQueryOptions) {
            var filterQueryString = filterQueryOptions.property + " " + this.getComparisonOperator(filterQueryOptions.operator);
            var propertyValueType = typeof (filterQueryOptions.propertyValue);
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
        };
        FilterQuery.prototype.getComparisonOperator = function (operator) {
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
        };
        return FilterQuery;
    })();
    TypeScriptedOData.FilterQuery = FilterQuery;
    var SubFilterQueryOperator;
    (function (SubFilterQueryOperator) {
        SubFilterQueryOperator[SubFilterQueryOperator["And"] = 0] = "And";
        SubFilterQueryOperator[SubFilterQueryOperator["Or"] = 1] = "Or";
    })(SubFilterQueryOperator || (SubFilterQueryOperator = {}));
    (function (ComparisonOperator) {
        ComparisonOperator[ComparisonOperator["Equals"] = 0] = "Equals";
        ComparisonOperator[ComparisonOperator["NotEquals"] = 1] = "NotEquals";
        ComparisonOperator[ComparisonOperator["GreaterThan"] = 2] = "GreaterThan";
        ComparisonOperator[ComparisonOperator["GreaterThanOrEqual"] = 3] = "GreaterThanOrEqual";
        ComparisonOperator[ComparisonOperator["LessThan"] = 4] = "LessThan";
        ComparisonOperator[ComparisonOperator["LessThanOrEqual"] = 5] = "LessThanOrEqual";
    })(TypeScriptedOData.ComparisonOperator || (TypeScriptedOData.ComparisonOperator = {}));
    var ComparisonOperator = TypeScriptedOData.ComparisonOperator;
    var ODataQuery = (function () {
        function ODataQuery() {
            this.queryOptions = {};
        }
        ODataQuery.prototype.select = function (properties) {
            this.queryOptions.$select = "$select=" + properties.join(",");
            return this;
        };
        ODataQuery.prototype.expand = function (properties, subQueries) {
            var _this = this;
            if (subQueries) {
                if (properties.length != subQueries.length) {
                    throw "There must be one subquery per entity, use null if no subquery is required";
                }
                this.queryOptions.$expand = "$expand=";
                properties.forEach(function (property, index) {
                    if (index > 0) {
                        _this.queryOptions.$expand += ",";
                    }
                    _this.queryOptions.$expand += property;
                    if (subQueries[index]) {
                        _this.queryOptions.$expand += "(" + subQueries[index].compile() + ")";
                    }
                });
            }
            else {
                this.queryOptions.$expand = "$expand=" + properties.join(",");
            }
            return this;
        };
        ODataQuery.prototype.take = function (amount) {
            this.queryOptions.$top = "$top=" + amount;
            return this;
        };
        ODataQuery.prototype.count = function (includeCount) {
            if (includeCount === false) {
                this.queryOptions.$count = "$count=false";
            }
            else {
                this.queryOptions.$count = "$count=true";
            }
            return this;
        };
        ODataQuery.prototype.filter = function (query) {
            this.queryOptions.$filter = "$filter=" + query.compile();
            return this;
        };
        ODataQuery.prototype.compile = function () {
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
            if (this.queryOptions.$count) {
                queryString += this.queryOptions.$count;
            }
            return queryString;
        };
        return ODataQuery;
    })();
    TypeScriptedOData.ODataQuery = ODataQuery;
})(TypeScriptedOData || (TypeScriptedOData = {}));
