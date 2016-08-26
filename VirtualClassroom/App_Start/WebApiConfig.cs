using System.Net.Http.Headers;
using System.Web.Http;

namespace VirtualClassroom
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "FormApi",
                routeTemplate: "api/Form/{action}/{uid}",
                defaults: new { controller = "Form", uid = RouteParameter.Optional },
                constraints: new { uid = new RouteConstraints.GuidConstraint() }
            );

            config.Routes.MapHttpRoute(
                name: "ClassroomDefaultApi",
                routeTemplate: "api/Classroom/{action}",
                defaults: new { controller = "Classroom" }
            );

            config.Routes.MapHttpRoute(
                name: "ClassroomApi",
                routeTemplate: "api/Classroom/{classroomId}/{action}/{id}",
                defaults: new { controller = "Classroom", classroomId = RouteParameter.Optional, id = RouteParameter.Optional }
            );

            config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
        }
    }
}
