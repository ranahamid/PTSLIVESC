using System;
using System.Web;
using System.Web.Routing;

namespace VirtualClassroom
{
    namespace RouteConstraints
    {
        public class StringConstraint : IRouteConstraint
        {
            public bool Match(HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection)
            {
                var value = values[parameterName] as string;
                return (!String.IsNullOrEmpty(value));
            }
        }

        public class GuidConstraint : IRouteConstraint
        {
            public bool Match(HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection)
            {
                var value = values[parameterName] as string;
                Guid guid;
                if (String.IsNullOrEmpty(value) || Guid.TryParse(value, out guid))
                {
                    return true;
                }
                return false;
            }
        }
    }
}