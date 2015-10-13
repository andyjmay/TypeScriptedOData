var TypeScriptedOData;
(function (TypeScriptedOData) {
    var ODataQuery = (function () {
        function ODataQuery() {
            this.queryOptions = {};
        }
        ODataQuery.prototype.select = function (entity, properties) {
            var entityProperties = properties.map(function (t) {
                return entity[t];
            });
            this.queryOptions.$select = "$select=" + entityProperties.join(",");
            return this;
        };
        ODataQuery.prototype.expand = function (entity, properties, subQueries) {
            var _this = this;
            var entityProperties = properties.map(function (t) {
                return entity[t];
            });
            if (subQueries) {
                if (properties.length != subQueries.length) {
                    throw "There must be one subquery per entity, use null if no subquery is required";
                }
                this.queryOptions.$expand = "$expand=";
                entityProperties.forEach(function (property, index) {
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
                this.queryOptions.$expand = "$expand=" + entityProperties.join(",");
            }
            return this;
        };
        ODataQuery.prototype.take = function (amount) {
            this.queryOptions.$top = "$top=" + amount;
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
            return queryString;
        };
        return ODataQuery;
    })();
    TypeScriptedOData.ODataQuery = ODataQuery;
})(TypeScriptedOData || (TypeScriptedOData = {}));
