using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.Web.Routing;
using Newtonsoft.Json;
using VirtualClassroom.Models;

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