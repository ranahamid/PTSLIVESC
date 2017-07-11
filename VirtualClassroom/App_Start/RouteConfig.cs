using System.Web.Mvc;
using System.Web.Routing;

namespace VirtualClassroom
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "PC",
                url: "PC/{classroomId}/{id}/{action}",
                defaults: new { controller = "PC", action = "Index", classroomId = UrlParameter.Optional, id = UrlParameter.Optional },
                constraints: new { classroomId = new RouteConstraints.StringConstraint(), id = new RouteConstraints.StringConstraint() }
            );

            routes.MapRoute(
                name: "Moderator",
                url: "Moderator/{classroomId}/{id}/{action}",
                defaults: new { controller = "Moderator", action = "Index", classroomId = UrlParameter.Optional, id = UrlParameter.Optional },
                constraints: new { classroomId = new RouteConstraints.StringConstraint(), id = new RouteConstraints.StringConstraint() }
            );

            routes.MapRoute(
                name: "PC2",
                url: "PC2/{classroomId}/{id}/{action}",
                defaults: new { controller = "PC2", action = "Index", classroomId = UrlParameter.Optional, id = UrlParameter.Optional },
                constraints: new { classroomId = new RouteConstraints.StringConstraint(), id = new RouteConstraints.StringConstraint() }
            );

            routes.MapRoute(
                name: "SC",
                url: "SC/{classroomId}/{id}/{action}",
                defaults: new { controller = "SC", action = "Index", classroomId = UrlParameter.Optional, id = UrlParameter.Optional },
                constraints: new { classroomId = new RouteConstraints.StringConstraint(), id = new RouteConstraints.StringConstraint() }
            );

            routes.MapRoute(
                name: "TC",
                url: "TC/{classroomId}/{id}/{action}",
                defaults: new { controller = "TC", action = "Index", classroomId = UrlParameter.Optional, id = UrlParameter.Optional },
                constraints: new { classroomId = new RouteConstraints.StringConstraint(), id = new RouteConstraints.StringConstraint() }
            );

            routes.MapRoute(
                name: "FC",
                url: "FC/{classroomId}/{id}/{action}",
                defaults: new { controller = "FC", action = "Index", classroomId = UrlParameter.Optional, id = UrlParameter.Optional },
                constraints: new { classroomId = new RouteConstraints.StringConstraint(), id = new RouteConstraints.StringConstraint() }
            );

            routes.MapRoute(
                name: "AC",
                url: "AC/{classroomId}/{action}",
                defaults: new { controller = "AC", action = "Index", classroomId = UrlParameter.Optional },
                constraints: new { classroomId = new RouteConstraints.StringConstraint() }
            );

            routes.MapRoute(
                name: "AdminClassroom",
                url: "Admin/Classroom/{classroomId}/{action}",
                defaults: new { controller = "Admin", action = "Classroom" },
                constraints: new { classroomId = new RouteConstraints.StringConstraint() }
            );

            routes.MapRoute(
                name: "Admin",
                url: "Admin/{action}",
                defaults: new { controller = "Admin", action = "Index" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}",
                defaults: new { controller = "Home", action = "Index" }
            );

        }
    }
}